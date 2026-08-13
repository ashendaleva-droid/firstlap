import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { childEmail } = (await req.json()) || {};
  if (!childEmail) {
    return NextResponse.json({ error: "Укажите email ребёнка" }, { status: 400 });
  }

  const childUser = await prisma.user.findUnique({
    where: { email: childEmail },
    include: { pilot: true },
  });

  if (!childUser || !childUser.pilot) {
    return NextResponse.json({ error: "Пилот с таким email не найден" }, { status: 404 });
  }

  const existing = await prisma.parentPilot.findUnique({
    where: { parentUserId_pilotId: { parentUserId: session.user.id, pilotId: childUser.pilot.id } },
  }).catch(() => null);

  if (existing) {
    return NextResponse.json({ error: "Этот ребёнок уже привязан к вашему аккаунту" }, { status: 400 });
  }

  await prisma.parentPilot.create({
    data: { parentUserId: session.user.id, pilotId: childUser.pilot.id },
  });

  return NextResponse.json({ ok: true });
}
