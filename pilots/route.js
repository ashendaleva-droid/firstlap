import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pilots = await prisma.pilot.findMany({
    include: { user: true },
    orderBy: { number: "asc" },
  });

  return NextResponse.json(
    pilots.map((p) => ({
      id: p.id,
      name: p.user.name,
      number: p.number,
      lessonsCompleted: p.lessonsCompleted,
    }))
  );
}
