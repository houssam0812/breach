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

  const { id: postId } = await params;

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

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existingVote = await db.vote.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  let scoreDelta = 0;

  if (value === 0) {
    // Remove vote
    if (existingVote) {
      scoreDelta = -existingVote.value;
      await db.vote.delete({
        where: { userId_postId: { userId: session.user.id, postId } },
      });
    }
  } else if (existingVote) {
    // Change vote
    scoreDelta = value - existingVote.value;
    await db.vote.update({
      where: { userId_postId: { userId: session.user.id, postId } },
      data: { value },
    });
  } else {
    // New vote
    scoreDelta = value;
    await db.vote.create({
      data: { userId: session.user.id, postId, value },
    });
  }

  const updatedPost = await db.post.update({
    where: { id: postId },
    data: { score: { increment: scoreDelta } },
    select: { score: true },
  });

  const newVote = value === 0 ? null : value;

  return NextResponse.json({ score: updatedPost.score, userVote: newVote });
}
