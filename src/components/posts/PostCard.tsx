import Link from "next/link";
import { MapPin, MessageSquare, Clock } from "lucide-react";
import { VoteButton } from "./VoteButton";
import { timeAgo } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    topic?: string;
    body: string;
    score: number;
    createdAt: Date | string;
    _count: { answers: number };
    author: { username: string; name: string | null };
    location: { name: string; slug: string; city: string | null };
  };
  userVote?: number | null;
}

export function PostCard({ post, userVote }: PostCardProps) {
  const excerpt =
    post.body.length > 200 ? post.body.slice(0, 200) + "…" : post.body;

  return (
    <article className="bg-breach-card border border-breach-border rounded-lg flex gap-0 hover:border-breach-text-muted transition-colors">
      {/* Vote column */}
      <div className="flex flex-col items-center bg-breach-dark/40 rounded-l-lg px-2 py-3 min-w-[44px]">
        <VoteButton
          score={post.score}
          userVote={userVote}
          targetId={post.id}
          targetType="post"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-3 min-w-0">
        {/* Location tag */}
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Link
            href={`/locations/${post.location.slug}`}
            className="inline-flex items-center gap-1 text-xs text-breach-blue-light hover:underline"
          >
            <MapPin className="w-3 h-3" />
            {post.location.name}
            {post.location.city ? `, ${post.location.city}` : ""}
          </Link>
          {post.topic && (
            <span className="inline-flex items-center rounded-full border border-breach-orange/30 bg-breach-orange/10 px-2 py-0.5 text-[11px] font-medium text-breach-orange">
              {post.topic}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/posts/${post.id}`}>
          <h2 className="text-breach-text font-semibold text-base leading-snug hover:text-white transition-colors line-clamp-2 mb-1">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-breach-text-muted text-sm line-clamp-2 mb-3">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-breach-text-muted">
          <span>
            by{" "}
            <Link
              href={`/user/${post.author.username}`}
              className="hover:text-breach-text transition-colors"
            >
              {post.author.username}
            </Link>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(post.createdAt)}
          </span>
          <Link
            href={`/posts/${post.id}`}
            className="flex items-center gap-1 hover:text-breach-text transition-colors ml-auto"
          >
            <MessageSquare className="w-3 h-3" />
            {post._count.answers}{" "}
            {post._count.answers === 1 ? "answer" : "answers"}
          </Link>
        </div>
      </div>
    </article>
  );
}
