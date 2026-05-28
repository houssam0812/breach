import { NextRequest, NextResponse } from "next/server";

interface OverpassNode {
  lat: number;
  lon: number;
}

interface OverpassElement {
  type: "way" | "relation" | "node";
  id: number;
  tags?: Record<string, string>;
  geometry?: OverpassNode[];
  members?: Array<{
    type: string;
    ref: number;
    role: string;
    geometry?: OverpassNode[];
  }>;
}

function closeRing(coords: number[][]): number[][] {
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...coords, first];
  }
  return coords;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const south = searchParams.get("south");
  const west = searchParams.get("west");
  const north = searchParams.get("north");
  const east = searchParams.get("east");

  if (!south || !west || !north || !east) {
    return NextResponse.json({ error: "Missing bbox params" }, { status: 400 });
  }

  const bbox = `${south},${west},${north},${east}`;
  const query = `[out:json][timeout:15];(way["place"~"^(suburb|neighbourhood|quarter)$"](${bbox});relation["place"~"^(suburb|neighbourhood|quarter)$"](${bbox});relation["boundary"="administrative"]["admin_level"~"^(7|8|9|10)$"](${bbox});way["boundary"="administrative"]["admin_level"~"^(7|8|9|10)$"](${bbox}););out geom;`;

  let overpassRes: Response;
  try {
    overpassRes = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "Breach/1.0 (location-qa-app)" } }
    );
  } catch {
    return NextResponse.json({ type: "FeatureCollection", features: [] });
  }

  if (!overpassRes.ok) {
    return NextResponse.json({ type: "FeatureCollection", features: [] });
  }

  const data = await overpassRes.json();
  const features: object[] = [];

  for (const el of data.elements as OverpassElement[]) {
    if (el.type === "way" && el.geometry && el.geometry.length >= 3) {
      const coords = closeRing(el.geometry.map((n) => [n.lon, n.lat]));
      features.push({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [coords] },
        properties: { name: el.tags?.name ?? null },
      });
    } else if (el.type === "relation" && el.members) {
      const outerRings = el.members
        .filter((m) => m.role === "outer" && m.geometry && m.geometry.length >= 3)
        .map((m) => closeRing(m.geometry!.map((n) => [n.lon, n.lat])));
      if (outerRings.length > 0) {
        features.push({
          type: "Feature",
          geometry: { type: "MultiPolygon", coordinates: outerRings.map((r) => [r]) },
          properties: { name: el.tags?.name ?? null },
        });
      }
    }
  }

  return NextResponse.json(
    { type: "FeatureCollection", features },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
  );
}
