import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, name: true, id: true } },
      location: { select: { name: true, slug: true, city: true, country: true } },
      answers: {
        orderBy: [{ isAccepted: "desc" }, { score: "desc" }],
        include: {
          author: { select: { username: true, name: true } },
          votes: session
            ? { where: { userId: session.user.id } }
            : false,
        },
      },
      votes: session ? { where: { userId: session.user.id } } : false,
      _count: { select: { answers: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
