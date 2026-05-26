import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MapPin, MessageSquare } from "lucide-react";
import { VoteButton } from "@/components/posts/VoteButton";
import { AnswerCard } from "@/components/answers/AnswerCard";
import { AnswerSection } from "@/components/answers/AnswerSection";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, select: { title: true } });
  return { title: post?.title || "Post" };
}

export default async function PostPage({ params }: PostPageProps) {
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
        },
      },
      _count: { select: { answers: true } },
    },
  });

  if (!post) notFound();

  // Get user votes
  let postVote: number | null = null;
  let answerVotes: Record<string, number> = {};

  if (session) {
    const [pv, avs] = await Promise.all([
      db.vote.findUnique({
        where: { userId_postId: { userId: session.user.id, postId: id } },
      }),
      db.vote.findMany({
        where: {
          userId: session.user.id,
          answerId: { in: post.answers.map((a) => a.id) },
        },
      }),
    ]);
    postVote = pv?.value ?? null;
    answerVotes = Object.fromEntries(avs.map((v) => [v.answerId!, v.value]));
  }

  const isPostAuthor = session?.user.id === post.author.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-breach-text-muted mb-4">
        <Link href="/" className="hover:text-breach-text transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/locations/${post.location.slug}`}
          className="hover:text-breach-text transition-colors flex items-center gap-1"
        >
          <MapPin className="w-3 h-3" />
          {post.location.name}
        </Link>
      </div>

      {/* Post */}
      <article className="bg-breach-card border border-breach-border rounded-lg flex gap-0 mb-6">
        {/* Vote column */}
        <div className="flex flex-col items-center bg-breach-dark/40 rounded-l-lg px-3 py-4 min-w-[52px]">
          <VoteButton
            score={post.score}
            userVote={postVote}
            targetId={post.id}
            targetType="post"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 min-w-0">
          <div className="mb-2">
            <Badge variant="location">
              <MapPin className="w-3 h-3" />
              <Link href={`/locations/${post.location.slug}`}>
                {post.location.name}
                {post.location.city ? `, ${post.location.city}` : ""}
              </Link>
            </Badge>
          </div>

          <h1 className="text-xl font-bold text-breach-text mb-3 leading-snug">
            {post.title}
          </h1>

          <div className="prose-breach text-breach-text text-sm whitespace-pre-line leading-relaxed mb-4">
            {post.body}
          </div>

          <div className="flex items-center gap-3 text-xs text-breach-text-muted border-t border-breach-border pt-3">
            <span>
              asked by{" "}
              <Link
                href={`/user/${post.author.username}`}
                className="hover:text-breach-text transition-colors"
              >
                {post.author.username}
              </Link>
            </span>
            <span>{timeAgo(post.createdAt)}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {post._count.answers} {post._count.answers === 1 ? "answer" : "answers"}
            </span>
          </div>
        </div>
      </article>

      {/* Answers section */}
      <AnswerSection
        postId={post.id}
        initialAnswers={post.answers.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        }))}
        answerVotes={answerVotes}
        isPostAuthor={isPostAuthor}
      />
    </div>
  );
}
