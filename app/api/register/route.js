import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();
  const { name, email, password, role, childEmail } = body || {};

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }
  if (!["PILOT", "COACH", "PARENT"].includes(role)) {
    return NextResponse.json({ error: "Некорректная роль" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Такой email уже зарегистрирован" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role } });

  if (role === "PILOT") {
    const count = await prisma.pilot.count();
    await prisma.pilot.create({ data: { userId: user.id, number: count + 1 } });
  }

  if (role === "COACH") {
    await prisma.coach.create({ data: { userId: user.id } });
  }

  if (role === "PARENT" && childEmail) {
    const childUser = await prisma.user.findUnique({ where: { email: childEmail }, include: { pilot: true } });
    if (childUser?.pilot) {
      await prisma.parentPilot.create({
        data: { parentUserId: user.id, pilotId: childUser.pilot.id },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
