import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { encodeGeohash6 } from "@/lib/location-utils";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ hasLocation: false });
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { lastKnownLat: true },
  });
  return NextResponse.json({ hasLocation: user?.lastKnownLat != null });
}

const schema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const { lat, lng } = parsed.data;
  const geohash6 = encodeGeohash6(lat, lng);

  await db.user.update({
    where: { id: session.user.id },
    data: {
      lastKnownLat: lat,
      lastKnownLng: lng,
      lastLocationAt: new Date(),
      geohash6,
    },
  });

  return NextResponse.json({ ok: true });
}
