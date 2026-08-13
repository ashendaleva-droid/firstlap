import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { pilotId, code } = (await req.json()) || {};
  if (!pilotId || !code) {
    return NextResponse.json({ error: "Нужны pilotId и code" }, { status: 400 });
  }

  const ach = await prisma.achievement.findUnique({ where: { code } });
  if (!ach) return NextResponse.json({ error: "Такого достижения нет" }, { status: 404 });

  await prisma.pilotAchievement.upsert({
    where: { pilotId_achievementId: { pilotId, achievementId: ach.id } },
    update: {},
    create: { pilotId, achievementId: ach.id },
  });

  return NextResponse.json({ ok: true });
}
