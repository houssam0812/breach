import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MapPin, Users, FileQuestion, TrendingUp, Clock } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { SubscribeButton } from "@/components/locations/SubscribeButton";
import Link from "next/link";
import type { Metadata } from "next";

interface LocationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await db.location.findUnique({ where: { slug }, select: { name: true, city: true } });
  if (!location) return { title: "Location not found" };
  return {
    title: `${location.name}${location.city ? `, ${location.city}` : ""}`,
  };
}

export default async function LocationPage({ params, searchParams }: LocationPageProps) {
  const { slug } = await params;
  const { sort = "hot" } = await searchParams;
  const session = await getServerSession(authOptions);

  const location = await db.location.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { posts: true, subscriptions: true },
      },
    },
  });

  if (!location) notFound();

  const orderBy =
    sort === "new" ? { createdAt: "desc" as const } : { score: "desc" as const };

  const posts = await db.post.findMany({
    where: { locationId: location.id },
    orderBy,
    take: 20,
    include: {
      author: { select: { username: true, name: true } },
      location: { select: { name: true, slug: true, city: true } },
      _count: { select: { answers: true } },
    },
  });

  let isSubscribed = false;
  let userVotes: Record<string, number> = {};

  if (session) {
    const [sub, votes] = await Promise.all([
      db.locationSubscription.findUnique({
        where: {
          userId_locationId: { userId: session.user.id, locationId: location.id },
        },
      }),
      db.vote.findMany({
        where: {
          userId: session.user.id,
          postId: { in: posts.map((p) => p.id) },
        },
      }),
    ]);
    isSubscribed = !!sub;
    userVotes = Object.fromEntries(votes.map((v) => [v.postId!, v.value]));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Sort tabs */}
        <div className="flex items-center gap-2 mb-5">
          <Link
            href={`/locations/${slug}?sort=hot`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sort !== "new"
                ? "bg-breach-card text-breach-text border border-breach-border"
                : "text-breach-text-muted hover:text-breach-text"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Hot
          </Link>
          <Link
            href={`/locations/${slug}?sort=new`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sort === "new"
                ? "bg-breach-card text-breach-text border border-breach-border"
                : "text-breach-text-muted hover:text-breach-text"
            }`}
          >
            <Clock className="w-4 h-4" />
            New
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <FileQuestion className="w-12 h-12 text-breach-text-muted mx-auto mb-4" />
            <h2 className="text-breach-text font-semibold text-lg mb-2">
              No questions yet
            </h2>
            <p className="text-breach-text-muted mb-5 text-sm">
              Be the first to ask about {location.name}!
            </p>
            <Link
              href={`/submit?location=${slug}`}
              className="inline-flex items-center gap-2 bg-breach-orange hover:bg-breach-orange-dark text-white font-medium px-5 py-2.5 rounded-full transition-colors text-sm"
            >
              Ask a question here
            </Link>
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

      {/* Sidebar */}
      <aside className="w-72 shrink-0 hidden lg:block">
        <div className="bg-breach-card border border-breach-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-breach-orange/10 border-b border-breach-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-breach-orange" />
              <h2 className="font-semibold text-breach-text text-sm">
                {location.name}
              </h2>
            </div>
            {location.city && (
              <p className="text-xs text-breach-text-muted mt-0.5">
                {location.city}
                {location.country ? `, ${location.country}` : ""}
              </p>
            )}
          </div>

          <div className="p-4 space-y-4">
            {location.address && (
              <p className="text-xs text-breach-text-muted">
                📍 {location.address}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-breach-text">
                  {location._count.posts}
                </div>
                <div className="text-xs text-breach-text-muted flex items-center justify-center gap-1">
                  <FileQuestion className="w-3 h-3" /> Questions
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-breach-text">
                  {location._count.subscriptions}
                </div>
                <div className="text-xs text-breach-text-muted flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> Subscribers
                </div>
              </div>
            </div>

            {/* Actions */}
            <SubscribeButton
              locationSlug={location.slug}
              isSubscribed={isSubscribed}
              subscriberCount={location._count.subscriptions}
            />

            <Link
              href={`/submit?location=${slug}`}
              className="block w-full text-center bg-breach-card border border-breach-border text-breach-text hover:border-breach-text-muted text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              Ask here
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
