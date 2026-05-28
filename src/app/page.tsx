import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostCard } from "@/components/posts/PostCard";
import dynamic from "next/dynamic";
import { MapPin, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { isWithin500m, NEARBY_DEGREES } from "@/lib/location-utils";

const PostMapSection = dynamic(
  () => import("@/components/posts/PostMapSection").then((mod) => mod.PostMapSection),
  { ssr: false }
);

interface HomePageProps {
  searchParams: Promise<{ sort?: string; page?: string; view?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = params.sort === "new" ? "new" : "hot";
  const view = params.view === "map" ? "map" : "list";
  const page = parseInt(params.page || "1");
  const session = await getServerSession(authOptions);

  const orderBy =
    sort === "new" ? { createdAt: "desc" as const } : { score: "desc" as const };

  // Resolve user location and subscriptions for visibility filtering
  let userLat: number | null = null;
  let userLng: number | null = null;
  let subscribedLocationIds: string[] = [];

  if (session) {
    const [dbUser, subs] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { lastKnownLat: true, lastKnownLng: true },
      }),
      db.locationSubscription.findMany({
        where: { userId: session.user.id },
        select: { locationId: true },
      }),
    ]);
    userLat = dbUser?.lastKnownLat ?? null;
    userLng = dbUser?.lastKnownLng ?? null;
    subscribedLocationIds = subs.map((s) => s.locationId);
  }

  // Build Prisma where clause for visibility:
  // - Authenticated + known location → nearby posts (bounding box pre-filter) + subscribed + own
  // - Authenticated, no location → subscribed + own + PUBLIC
  // - Anonymous → PUBLIC only
  let whereClause: Prisma.PostWhereInput;

  if (session && userLat !== null && userLng !== null) {
    const lat = userLat;
    const lng = userLng;
    whereClause = {
      OR: [
        // Nearby: bounding-box pre-filter (precise Haversine applied after fetch)
        {
          location: {
            lat: { gte: lat - NEARBY_DEGREES, lte: lat + NEARBY_DEGREES },
            lng: { gte: lng - NEARBY_DEGREES, lte: lng + NEARBY_DEGREES },
          },
        },
        // Subscribed locations
        ...(subscribedLocationIds.length > 0
          ? [{ locationId: { in: subscribedLocationIds } }]
          : []),
        // Own posts
        { authorId: session.user.id },
        // Public posts always visible
        { visibility: "PUBLIC" as const },
      ],
    };
  } else if (session) {
    whereClause = {
      OR: [
        ...(subscribedLocationIds.length > 0
          ? [{ locationId: { in: subscribedLocationIds } }]
          : []),
        { authorId: session.user.id },
        { visibility: "PUBLIC" as const },
      ],
    };
  } else {
    whereClause = { visibility: "PUBLIC" as const };
  }

  const [rawPosts, topLocations] = await Promise.all([
    db.post.findMany({
      where: whereClause,
      orderBy,
      take: 40, // fetch extra to account for Haversine filtering
      skip: (page - 1) * 20,
      include: {
        author: { select: { username: true, name: true } },
        location: { select: { name: true, slug: true, city: true, lat: true, lng: true } },
        _count: { select: { answers: true } },
      },
    }),
    db.location.findMany({
      where: { level: "PLACE" },
      orderBy: { postCount: "desc" },
      take: 8,
      select: { name: true, slug: true, city: true, postCount: true },
    }),
  ]);

  // Precise Haversine filter for nearby posts (bounding box may include posts 501m–800m away)
  const posts = (
    userLat !== null && userLng !== null
      ? rawPosts.filter((p) => {
          const isSubscribed = subscribedLocationIds.includes(p.locationId);
          const isOwn = session && p.authorId === session.user.id;
          const isPublic = p.visibility === "PUBLIC";
          const isNearby = isWithin500m(userLat!, userLng!, p.location.lat, p.location.lng);
          return isNearby || isSubscribed || isOwn || isPublic;
        })
      : rawPosts
  ).slice(0, 20);

  // Get user votes if logged in
  let userVotes: Record<string, number> = {};
  if (session) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        postId: { in: posts.map((p) => p.id) },
      },
    });
    userVotes = Object.fromEntries(
      votes.map((v) => [v.postId!, v.value])
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
      {/* Main feed */}
      <div className="flex-1 min-w-0">
        {/* View toggle */}
        <div className="mb-4 inline-flex items-center gap-1 rounded-full border border-breach-border bg-breach-card p-1">
          <Link
            href={`/?sort=${sort}&view=list`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-breach-orange text-white"
                : "text-breach-text-muted hover:text-breach-text"
            }`}
          >
            List
          </Link>
          <Link
            href={`/?sort=${sort}&view=map`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "map"
                ? "bg-breach-orange text-white"
                : "text-breach-text-muted hover:text-breach-text"
            }`}
          >
            Map
          </Link>
        </div>

        {view === "map" && (
          <PostMapSection
            posts={posts.map((post) => ({
              id: post.id,
              title: post.title,
              location: {
                name: post.location.name,
                slug: post.location.slug,
                city: post.location.city,
                lat: post.location.lat,
                lng: post.location.lng,
              },
            }))}
          />
        )}

        {/* Sort tabs */}
        <div className="flex items-center gap-2 mb-5">
          <Link
            href={`/?sort=hot&view=${view}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sort === "hot"
                ? "bg-breach-card text-breach-text border border-breach-border"
                : "text-breach-text-muted hover:text-breach-text"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Hot
          </Link>
          <Link
            href={`/?sort=new&view=${view}`}
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

        {/* Posts */}
        {view === "list" && posts.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-breach-text-muted mx-auto mb-4" />
            <h2 className="text-breach-text font-semibold text-xl mb-2">
              {session && !session.user.hasLocation
                ? "No questions in your subscriptions yet"
                : "No questions near you yet"}
            </h2>
            <p className="text-breach-text-muted mb-6">
              {session && !session.user.hasLocation
                ? "Share your location to see questions from nearby places."
                : "Be the first to ask about a location near you!"}
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-breach-orange hover:bg-breach-orange-dark text-white font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              Ask a question
            </Link>
          </div>
        ) : view === "list" ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                userVote={userVotes[post.id] ?? null}
              />
            ))}
          </div>
        ) : null}

        {/* Pagination */}
        {view === "list" && posts.length === 20 && (
          <div className="flex justify-center mt-8">
            <Link
              href={`/?sort=${sort}&view=${view}&page=${page + 1}`}
              className="bg-breach-card border border-breach-border text-breach-text hover:border-breach-text-muted px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Load more
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-72 shrink-0 hidden lg:block">
        {/* Welcome card */}
        <div className="bg-breach-card border border-breach-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-breach-orange" />
            <h3 className="font-semibold text-breach-text">About Breach</h3>
          </div>
          <p className="text-sm text-breach-text-muted mb-4">
            Ask questions about any place and get answers from people who&apos;ve
            been there. Subscribe to locations to stay updated.
          </p>
          <Link
            href="/submit"
            className="block w-full text-center bg-breach-orange hover:bg-breach-orange-dark text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            Ask a question
          </Link>
          {!session && (
            <Link
              href="/register"
              className="block w-full text-center mt-2 border border-breach-orange text-breach-orange hover:bg-breach-orange hover:text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              Create account
            </Link>
          )}
        </div>

        {/* Top locations */}
        {topLocations.length > 0 && (
          <div className="bg-breach-card border border-breach-border rounded-lg p-4">
            <h3 className="font-semibold text-breach-text text-sm mb-3">
              Popular locations
            </h3>
            <ul className="space-y-2">
              {topLocations.map((loc) => (
                <li key={loc.slug}>
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="flex items-center justify-between text-sm group"
                  >
                    <span className="flex items-center gap-1.5 text-breach-text-muted group-hover:text-breach-text transition-colors min-w-0">
                      <MapPin className="w-3 h-3 text-breach-orange shrink-0" />
                      <span className="truncate">{loc.name}</span>
                    </span>
                    <span className="text-xs text-breach-text-muted ml-2 shrink-0">
                      {loc.postCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
