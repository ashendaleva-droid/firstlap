import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const links = await prisma.parentPilot.findMany({
    where: { parentUserId: session.user.id },
    include: { pilot: { include: { user: true } } },
  });

  return NextResponse.json(
    links.map((l) => ({
      id: l.pilot.id,
      name: l.pilot.user.name,
      number: l.pilot.number,
      lessonsCompleted: l.pilot.lessonsCompleted,
    }))
  );
}
