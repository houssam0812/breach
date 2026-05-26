import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(10).max(300),
  body: z.string().min(20),
  location: z.object({
    name: z.string().min(1),
    address: z.string(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    lat: z.number(),
    lng: z.number(),
  }),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "hot";
  const locationSlug = searchParams.get("location");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const orderBy =
    sort === "new"
      ? { createdAt: "desc" as const }
      : { score: "desc" as const };

  const posts = await db.post.findMany({
    where: locationSlug
      ? { location: { slug: locationSlug } }
      : undefined,
    orderBy,
    take: limit,
    skip: (page - 1) * limit,
    include: {
      author: { select: { username: true, name: true } },
      location: { select: { name: true, slug: true, city: true } },
      _count: { select: { answers: true } },
    },
  });

  return NextResponse.json(posts);
}

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

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, body: postBody, location } = parsed.data;

  // Find or create location
  const baseSlug = slugify(`${location.name} ${location.city || ""}`).slice(0, 60);
  let locationSlug = baseSlug;

  // Ensure unique slug
  let existing = await db.location.findUnique({ where: { slug: locationSlug } });
  if (existing && (Math.abs(existing.lat - location.lat) > 0.01 || Math.abs(existing.lng - location.lng) > 0.01)) {
    locationSlug = `${baseSlug}-${Date.now()}`;
  }

  const locationRecord = await db.location.upsert({
    where: { slug: locationSlug },
    create: {
      name: location.name,
      address: location.address,
      city: location.city,
      country: location.country,
      lat: location.lat,
      lng: location.lng,
      slug: locationSlug,
    },
    update: {
      postCount: { increment: 1 },
    },
  });

  // Also increment if we just created it (upsert create doesn't fire update)
  if (locationRecord.postCount === 0) {
    await db.location.update({
      where: { id: locationRecord.id },
      data: { postCount: 1 },
    });
  }

  const post = await db.post.create({
    data: {
      title,
      body: postBody,
      authorId: session.user.id,
      locationId: locationRecord.id,
    },
    include: {
      author: { select: { username: true, name: true } },
      location: { select: { name: true, slug: true, city: true } },
      _count: { select: { answers: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
