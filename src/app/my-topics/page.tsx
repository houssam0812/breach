import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Hash } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My topics",
};

type TopicBucket = {
  topic: string;
  count: number;
  latestId: string;
  latestTitle: string;
};

function groupTopics(items: Array<{ topic: string; id: string; title: string }>): TopicBucket[] {
  const map = new Map<string, TopicBucket>();

  for (const item of items) {
    const key = item.topic.trim().toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }

    map.set(key, {
      topic: key,
      count: 1,
      latestId: item.id,
      latestTitle: item.title,
    });
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export default async function MyTopicsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/my-topics");

  const [myPosts, myAnswers] = await Promise.all([
    db.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, topic: true },
      take: 250,
    }),
    db.answer.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { post: { select: { id: true, title: true, topic: true } } },
      take: 250,
    }),
  ]);

  const askedTopics = groupTopics(myPosts);
  const answeredTopics = groupTopics(
    myAnswers.map((a) => ({
      id: a.post.id,
      title: a.post.title,
      topic: a.post.topic,
    }))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-7 space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-breach-text mb-2">My topics</h1>
        <p className="text-sm text-breach-text-muted">
          Topics based on questions you asked and answers you posted.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-breach-text-muted mb-3">
          Questions I asked
        </h2>
        {askedTopics.length === 0 ? (
          <div className="rounded-xl border border-breach-border bg-breach-card p-5 text-sm text-breach-text-muted">
            You have not asked any questions yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {askedTopics.map((item) => (
              <article key={`asked-${item.topic}`} className="rounded-xl border border-breach-border bg-breach-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-breach-orange/10 px-2.5 py-1 text-xs font-medium text-breach-orange border border-breach-orange/20">
                    <Hash className="w-3 h-3" /> {item.topic}
                  </span>
                  <span className="text-xs text-breach-text-muted">{item.count}</span>
                </div>
                <Link href={`/posts/${item.latestId}`} className="text-sm text-breach-text hover:text-white transition-colors line-clamp-2">
                  {item.latestTitle}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-breach-text-muted mb-3">
          Questions I answered
        </h2>
        {answeredTopics.length === 0 ? (
          <div className="rounded-xl border border-breach-border bg-breach-card p-5 text-sm text-breach-text-muted">
            You have not answered any questions yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {answeredTopics.map((item) => (
              <article key={`answered-${item.topic}`} className="rounded-xl border border-breach-border bg-breach-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-breach-blue/10 px-2.5 py-1 text-xs font-medium text-breach-blue-light border border-breach-blue/20">
                    <Hash className="w-3 h-3" /> {item.topic}
                  </span>
                  <span className="text-xs text-breach-text-muted">{item.count}</span>
                </div>
                <Link href={`/posts/${item.latestId}`} className="text-sm text-breach-text hover:text-white transition-colors line-clamp-2">
                  {item.latestTitle}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}