import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ flag: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }
  const { slug } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz istek" }, { status: 400 });
  }

  const lab = await prisma.lab.findUnique({ where: { slug } });
  if (!lab) {
    return NextResponse.json({ error: "Laboratuvar bulunamadi" }, { status: 404 });
  }

  const userId = (session.user as { id: string }).id;
  const correct = parsed.data.flag.trim() === lab.flag;

  await prisma.submission.create({
    data: { userId, labId: lab.id, correct },
  });

  if (correct) {
    const already = await prisma.submission.findFirst({
      where: { userId, labId: lab.id, correct: true, NOT: { id: undefined } },
    });
    // Puanlari yalnizca ilk dogru cozumde ekle
    const priorCorrectCount = await prisma.submission.count({
      where: { userId, labId: lab.id, correct: true },
    });
    if (priorCorrectCount === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: lab.points } },
      });
    }
    void already;
  }

  return NextResponse.json({ correct });
}
