import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }
  const { slug } = await params;

  const lab = await prisma.lab.findUnique({ where: { slug } });
  if (!lab) {
    return NextResponse.json({ error: "Laboratuvar bulunamadi" }, { status: 404 });
  }

  // Not: Gercek izole konteyner burada degil, ayri bir lab-runner servisinde
  // provizyonlanir (bkz. README). Burada yalnizca oturum kaydi tutulur.
  const labSession = await prisma.labSession.create({
    data: {
      userId: (session.user as { id: string }).id,
      labId: lab.id,
      status: "RUNNING",
      runnerNote: "simulasyon modu: lab-runner servisi baglanmadi",
    },
  });

  return NextResponse.json({ sessionId: labSession.id, status: labSession.status });
}
