import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TOTAL_LESSONS = 8;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { pilotId, laps, comment, task } = body || {};

  if (!pilotId || !Array.isArray(laps) || laps.length === 0) {
    return NextResponse.json({ error: "Нужен пилот и хотя бы один круг" }, { status: 400 });
  }

  const pilot = await prisma.pilot.findUnique({ where: { id: pilotId } });
  if (!pilot) return NextResponse.json({ error: "Пилот не найден" }, { status: 404 });

  const priorSessionsCount = await prisma.trainingSession.count({ where: { pilotId } });
  const priorLaps = await prisma.lapTime.findMany({ where: { session: { pilotId } } });
  const prevPR = priorLaps.length ? Math.min(...priorLaps.map((l) => l.timeMs)) : null;

  const cleanLaps = laps.map((ms) => Math.round(ms)).filter((ms) => ms > 0);
  const newBest = Math.min(...cleanLaps);
  const isNewPR = prevPR == null || newBest < prevPR;

  const newSession = await prisma.trainingSession.create({
    data: {
      pilotId,
      lessonIndex: pilot.lessonsCompleted,
      comment: comment || null,
      task: task || null,
      laps: {
        create: cleanLaps.map((ms) => ({ timeMs: ms, isPersonalRecord: isNewPR && ms === newBest })),
      },
    },
  });

  const newLessonsCompleted = Math.min(pilot.lessonsCompleted + 1, TOTAL_LESSONS);
  const xpGain = 20 + (isNewPR ? 30 : 0);

  const codesToAward = [];
  if (priorSessionsCount === 0) codesToAward.push("first_lap");
  if (isNewPR && priorSessionsCount > 0) {
    codesToAward.push("first_record");
    codesToAward.push("faster");
  }
  if (newLessonsCompleted >= TOTAL_LESSONS) codesToAward.push("young_pilot");

  for (const code of codesToAward) {
    const ach = await prisma.achievement.findUnique({ where: { code } });
    if (ach) {
      await prisma.pilotAchievement.upsert({
        where: { pilotId_achievementId: { pilotId, achievementId: ach.id } },
        update: {},
        create: { pilotId, achievementId: ach.id },
      });
    }
  }

  await prisma.pilot.update({
    where: { id: pilotId },
    data: { lessonsCompleted: newLessonsCompleted, xp: { increment: xpGain } },
  });

  return NextResponse.json({ ok: true, sessionId: newSession.id, isNewPR, xpGain });
}
