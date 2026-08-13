import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pilotIdParam = searchParams.get("pilotId");

  let pilot = null;

  if (session.user.role === "PILOT") {
    pilot = await prisma.pilot.findUnique({ where: { userId: session.user.id } });
  } else if (session.user.role === "PARENT") {
    if (!pilotIdParam) return NextResponse.json({ error: "pilotId обязателен" }, { status: 400 });
    const link = await prisma.parentPilot.findFirst({
      where: { parentUserId: session.user.id, pilotId: pilotIdParam },
    });
    if (!link) return NextResponse.json({ error: "Этот ребёнок не привязан к вашему аккаунту" }, { status: 403 });
    pilot = await prisma.pilot.findUnique({ where: { id: pilotIdParam } });
  } else if (session.user.role === "COACH") {
    if (!pilotIdParam) return NextResponse.json({ error: "pilotId обязателен" }, { status: 400 });
    pilot = await prisma.pilot.findUnique({ where: { id: pilotIdParam } });
  }

  if (!pilot) return NextResponse.json({ error: "Пилот не найден" }, { status: 404 });

  const pilotUser = await prisma.user.findUnique({ where: { id: pilot.userId } });
  const sessions = await prisma.trainingSession.findMany({
    where: { pilotId: pilot.id },
    orderBy: { date: "asc" },
    include: { laps: true },
  });
  const achievements = await prisma.pilotAchievement.findMany({
    where: { pilotId: pilot.id },
    include: { achievement: true },
  });

  return NextResponse.json({
    pilot: {
      id: pilot.id,
      name: pilotUser?.name || "Пилот",
      email: pilotUser?.email || null,
      number: pilot.number,
      xp: pilot.xp,
      lessonsCompleted: pilot.lessonsCompleted,
      currentCourse: pilot.currentCourse,
    },
    sessions: sessions.map((s) => ({
      id: s.id,
      lessonIndex: s.lessonIndex,
      date: s.date,
      laps: s.laps.map((l) => l.timeMs),
      comment: s.comment,
      task: s.task,
    })),
    achievements: achievements.map((a) => a.achievement.code),
  });
}
