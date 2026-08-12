import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PILOT") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { amount } = (await req.json()) || {};
  const pilot = await prisma.pilot.findUnique({ where: { userId: session.user.id } });
  if (!pilot) return NextResponse.json({ error: "Пилот не найден" }, { status: 404 });

  const updated = await prisma.pilot.update({
    where: { id: pilot.id },
    data: { xp: { increment: Math.max(0, Math.min(100, amount || 0)) } },
  });

  return NextResponse.json({ xp: updated.xp });
}
