import ngeohash from "ngeohash";

/**
 * Encode lat/lng to a geohash string.
 * Precision 6 ≈ 1.2km × 0.6km cell — used as a coarse filter only.
 */
export function encodeGeohash6(lat: number, lng: number): string {
  return ngeohash.encode(lat, lng, 6);
}

/**
 * Haversine distance between two coordinates, in metres.
 */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns true if two coordinates are within 500 metres of each other.
 */
export function isWithin500m(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): boolean {
  return haversineMeters(lat1, lng1, lat2, lng2) <= 500;
}

/**
 * Conservative bounding-box offset in degrees that covers ≥500 m in all
 * directions.  1° latitude ≈ 111 km → 0.005° ≈ 555 m.  We use the same
 * value for longitude (slightly over-inclusive near the equator, fine).
 */
export const NEARBY_DEGREES = 0.005;
