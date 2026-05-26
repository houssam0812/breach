import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: answerId } = await params;

  const answer = await db.answer.findUnique({
    where: { id: answerId },
    include: { post: { select: { authorId: true } } },
  });

  if (!answer) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 });
  }

  if (answer.post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Unaccept all other answers in the post, accept this one
  await db.$transaction([
    db.answer.updateMany({
      where: { postId: answer.postId },
      data: { isAccepted: false },
    }),
    db.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    }),
  ]);

  return NextResponse.json({ accepted: true });
}
