"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MapBoundaryLayer } from "@/components/map/MapBoundaryLayer";

type PostMapPoint = {
  id: string;
  title: string;
  location: {
    name: string;
    slug: string;
    city: string | null;
    lat: number;
    lng: number;
  };
};

type MapCluster = {
  slug: string;
  name: string;
  city: string | null;
  lat: number;
  lng: number;
  posts: PostMapPoint[];
};

interface PostMapSectionProps {
  posts: PostMapPoint[];
}

function groupByLocation(posts: PostMapPoint[]): MapCluster[] {
  const clusters = new Map<string, MapCluster>();

  for (const post of posts) {
    const { slug, name, city, lat, lng } = post.location;
    const existing = clusters.get(slug);

    if (existing) {
      existing.posts.push(post);
      continue;
    }

    clusters.set(slug, {
      slug,
      name,
      city,
      lat,
      lng,
      posts: [post],
    });
  }

  return Array.from(clusters.values());
}


function MapClickReset({ onReset }: { onReset: () => void }) {
  useMapEvents({
    click() {
      onReset();
    },
  });

  return null;
}

export function PostMapSection({ posts }: PostMapSectionProps) {
  const clusters = groupByLocation(posts);
  const hasData = clusters.length > 0;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedCluster = useMemo(
    () => clusters.find((cluster) => cluster.slug === selectedSlug) ?? null,
    [clusters, selectedSlug]
  );

  const mapCenter: [number, number] = hasData
    ? [clusters[0].lat, clusters[0].lng]
    : [20, 0];

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  return (
    <section id="map" className="bg-breach-card border border-breach-border rounded-2xl overflow-hidden mb-6">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <Badge variant="new" className="mb-0">
            <MapPin className="w-3 h-3" />
            Map view
          </Badge>
        </div>

        <div className="text-xs text-breach-text-muted flex items-center gap-2 shrink-0">
          <span className="inline-flex h-2 w-2 rounded-full bg-breach-orange shadow-[0_0_0_6px_rgba(247,116,30,0.14)]" />
          {clusters.length} location{clusters.length !== 1 ? "s" : ""}
          mapped
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.55fr)_320px] border-t border-breach-border">
        <div className="relative min-h-[420px] overflow-hidden bg-[#0f2f55]">
          {hasData ? (
            <MapContainer
              center={mapCenter}
              zoom={2}
              minZoom={2}
              className="h-[420px] w-full"
              worldCopyJump
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickReset onReset={() => setSelectedSlug(null)} />
              <MapBoundaryLayer />

              {clusters.map((cluster) => (
                <Marker
                  key={cluster.slug}
                  position={[cluster.lat, cluster.lng]}
                  eventHandlers={{
                    click: () => setSelectedSlug(cluster.slug),
                  }}
                >
                  <Popup>
                    <div className="text-sm min-w-[190px]">
                      <div className="font-semibold mb-1">{cluster.name}</div>
                      <div className="text-xs text-slate-600 mb-2">
                        {cluster.posts.length} question
                        {cluster.posts.length !== 1 ? "s" : ""}
                      </div>
                      <Link className="text-xs text-blue-600 underline" href={`/locations/${cluster.slug}`}>
                        Open location feed
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-sm rounded-2xl border border-breach-border bg-breach-dark/70 p-5 text-center shadow-2xl">
                <h3 className="text-sm font-semibold text-breach-text mb-1">
                  No mapped posts yet
                </h3>
                <p className="text-xs text-breach-text-muted mb-3">
                  Ask the first location-based question and it will appear as
                  a marker here.
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center rounded-full bg-breach-orange px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-breach-orange-dark"
                >
                  Ask a question
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="border-t border-breach-border bg-breach-dark/35 lg:border-l lg:border-t-0">
          <div className="p-4 border-b border-breach-border">
            <h3 className="text-sm font-semibold text-breach-text">Questions</h3>
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2">
            {selectedCluster ? (
              <ul className="space-y-2">
                {selectedCluster.posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.id}`}
                      className="group flex items-start gap-3 rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-breach-border hover:bg-breach-card"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-breach-orange/10 text-breach-orange">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-breach-text group-hover:text-white">
                          {post.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-breach-text-muted">
                          {selectedCluster.name}
                          {selectedCluster.city ? `, ${selectedCluster.city}` : ""}
                        </span>
                      </span>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-breach-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-4 text-xs text-breach-text-muted">
                Click any marker on the map to see the related questions.
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}