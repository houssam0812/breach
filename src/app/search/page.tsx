import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostCard } from "@/components/posts/PostCard";
import { Search } from "lucide-react";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!q || q.trim().length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Search className="w-12 h-12 text-breach-text-muted mx-auto mb-4" />
        <h1 className="text-breach-text font-semibold text-xl mb-2">Search Breach</h1>
        <p className="text-breach-text-muted">Enter a search term to find questions and locations.</p>
      </div>
    );
  }

  const [posts, locations] = await Promise.all([
    db.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { topic: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { score: "desc" },
      take: 20,
      include: {
        author: { select: { username: true, name: true } },
        location: { select: { name: true, slug: true, city: true } },
        _count: { select: { answers: true } },
      },
    }),
    db.location.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { name: true, slug: true, city: true, postCount: true },
    }),
  ]);

  let userVotes: Record<string, number> = {};
  if (session) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        postId: { in: posts.map((p) => p.id) },
      },
    });
    userVotes = Object.fromEntries(votes.map((v) => [v.postId!, v.value]));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-breach-text font-semibold text-lg mb-1">
        Results for &ldquo;{q}&rdquo;
      </h1>
      <p className="text-breach-text-muted text-sm mb-6">
        {posts.length} question{posts.length !== 1 ? "s" : ""}
        {locations.length > 0 ? `, ${locations.length} location${locations.length !== 1 ? "s" : ""}` : ""}
      </p>

      {/* Locations */}
      {locations.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-breach-text-muted mb-2">
            Locations
          </h2>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <a
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className="flex items-center gap-1.5 bg-breach-card border border-breach-border hover:border-breach-orange text-breach-text text-sm px-3 py-1.5 rounded-full transition-colors"
              >
                📍 {loc.name}
                {loc.city ? `, ${loc.city}` : ""}
                <span className="text-breach-text-muted text-xs">({loc.postCount})</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-breach-text-muted">No questions found for &ldquo;{q}&rdquo;.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userVote={userVotes[post.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
