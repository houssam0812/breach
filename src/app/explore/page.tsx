import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore topics",
};

type TopicSummary = {
  topic: string;
  count: number;
  latestPostId: string;
  latestTitle: string;
  latestLocationSlug: string;
  latestLocationName: string;
};

export default async function ExplorePage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      title: true,
      topic: true,
      location: { select: { slug: true, name: true } },
    },
  });

  const summaries: Record<string, TopicSummary> = {};

  for (const post of posts) {
    const key = post.topic.trim().toLowerCase();
    const existing = summaries[key];

    if (existing) {
      existing.count += 1;
      continue;
    }

    summaries[key] = {
      topic: key,
      count: 1,
      latestPostId: post.id,
      latestTitle: post.title,
      latestLocationSlug: post.location.slug,
      latestLocationName: post.location.name,
    };
  }

  const topics = Object.values(summaries).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-5xl mx-auto px-4 py-7">
      <h1 className="text-2xl font-bold text-breach-text mb-2">Explore topics</h1>
      <p className="text-sm text-breach-text-muted mb-6">
        Discover what people are asking by topic.
      </p>

      {topics.length === 0 ? (
        <div className="rounded-xl border border-breach-border bg-breach-card p-6 text-sm text-breach-text-muted">
          No topics yet. Create the first question to start a topic.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((item) => (
            <article
              key={item.topic}
              className="rounded-xl border border-breach-border bg-breach-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-breach-orange/10 px-2.5 py-1 text-xs font-medium text-breach-orange border border-breach-orange/20">
                  # {item.topic}
                </span>
                <span className="text-xs text-breach-text-muted">
                  {item.count} question{item.count !== 1 ? "s" : ""}
                </span>
              </div>

              <Link href={`/posts/${item.latestPostId}`} className="block text-sm text-breach-text hover:text-white transition-colors mb-2 line-clamp-2">
                {item.latestTitle}
              </Link>

              <Link
                href={`/locations/${item.latestLocationSlug}`}
                className="inline-flex items-center gap-1 text-xs text-breach-blue-light hover:underline"
              >
                📍
                {item.latestLocationName}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}