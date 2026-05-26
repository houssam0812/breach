import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: answerId } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
  }

  const { value } = parsed.data;

  const answer = await db.answer.findUnique({ where: { id: answerId } });
  if (!answer) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 });
  }

  const existingVote = await db.vote.findUnique({
    where: { userId_answerId: { userId: session.user.id, answerId } },
  });

  let scoreDelta = 0;

  if (value === 0) {
    if (existingVote) {
      scoreDelta = -existingVote.value;
      await db.vote.delete({
        where: { userId_answerId: { userId: session.user.id, answerId } },
      });
    }
  } else if (existingVote) {
    scoreDelta = value - existingVote.value;
    await db.vote.update({
      where: { userId_answerId: { userId: session.user.id, answerId } },
      data: { value },
    });
  } else {
    scoreDelta = value;
    await db.vote.create({
      data: { userId: session.user.id, answerId, value },
    });
  }

  const updatedAnswer = await db.answer.update({
    where: { id: answerId },
    data: { score: { increment: scoreDelta } },
    select: { score: true },
  });

  const newVote = value === 0 ? null : value;

  return NextResponse.json({ score: updatedAnswer.score, userVote: newVote });
}
