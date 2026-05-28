import dynamic from "next/dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const FullPageMap = dynamic(() => import("@/components/map/FullPageMap"), { ssr: false });

export default async function MapPage() {
  const session = await getServerSession(authOptions);

  const [posts, userLocation] = await Promise.all([
    db.post.findMany({
      select: {
        id: true,
        title: true,
        location: {
          select: { name: true, slug: true, city: true, lat: true, lng: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    session?.user?.id
      ? db.user.findUnique({
          where: { id: session.user.id },
          select: { lastKnownLat: true, lastKnownLng: true },
        })
      : null,
  ]);

  const initialCenter: [number, number] | null =
    userLocation?.lastKnownLat != null && userLocation?.lastKnownLng != null
      ? [userLocation.lastKnownLat, userLocation.lastKnownLng]
      : null;

  return (
    <main className="pt-12">
      <FullPageMap posts={posts} initialCenter={initialCenter} />
    </main>
  );
}
