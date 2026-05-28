import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const neighbourhoods = await db.location.findMany({
    where: {
      level: "NEIGHBOURHOOD",
      polygon: { not: null },
    },
    select: {
      id: true,
      name: true,
      city: true,
      slug: true,
      lat: true,
      lng: true,
      polygon: true,
    },
  });

  return NextResponse.json(neighbourhoods);
}
