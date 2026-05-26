import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const location = await db.location.findUnique({ where: { slug } });
  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const existing = await db.locationSubscription.findUnique({
    where: {
      userId_locationId: { userId: session.user.id, locationId: location.id },
    },
  });

  if (existing) {
    await db.locationSubscription.delete({
      where: {
        userId_locationId: { userId: session.user.id, locationId: location.id },
      },
    });

    const subscriberCount = await db.locationSubscription.count({
      where: { locationId: location.id },
    });

    return NextResponse.json({ subscribed: false, subscriberCount });
  } else {
    await db.locationSubscription.create({
      data: { userId: session.user.id, locationId: location.id },
    });

    const subscriberCount = await db.locationSubscription.count({
      where: { locationId: location.id },
    });

    return NextResponse.json({ subscribed: true, subscriberCount });
  }
}
