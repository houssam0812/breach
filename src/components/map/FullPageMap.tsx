"use client";

import Link from "next/link";
import { useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { MapPin, ArrowUpRight, X } from "lucide-react";
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

function groupByLocation(posts: PostMapPoint[]): MapCluster[] {
  const clusters = new Map<string, MapCluster>();
  for (const post of posts) {
    const { slug, name, city, lat, lng } = post.location;
    const existing = clusters.get(slug);
    if (existing) {
      existing.posts.push(post);
    } else {
      clusters.set(slug, { slug, name, city, lat, lng, posts: [post] });
    }
  }
  return Array.from(clusters.values());
}

function MapClickReset({ onReset }: { onReset: () => void }) {
  useMapEvents({ click: onReset });
  return null;
}

interface FullPageMapProps {
  posts: PostMapPoint[];
  initialCenter?: [number, number] | null;
}

export default function FullPageMap({ posts, initialCenter }: FullPageMapProps) {
  const clusters = groupByLocation(posts);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedCluster = clusters.find((c) => c.slug === selectedSlug) ?? null;

  const mapCenter: [number, number] =
    initialCenter ??
    (clusters.length > 0 ? [clusters[0].lat, clusters[0].lng] : [48.8566, 2.3522]);
  const defaultZoom = initialCenter ? 13 : clusters.length > 0 ? 13 : 11;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  return (
    <div className="relative" style={{ height: "calc(100vh - 3rem)" }}>
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        minZoom={2}
        className="h-full w-full"
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundaryLayer />
        <MapClickReset onReset={() => setSelectedSlug(null)} />

        {clusters.map((cluster) => (
          <Marker
            key={cluster.slug}
            position={[cluster.lat, cluster.lng]}
            eventHandlers={{ click: (e) => { e.originalEvent.stopPropagation(); setSelectedSlug(cluster.slug); } }}
          >
            <Popup>
              <div className="text-sm min-w-[190px]">
                <div className="font-semibold mb-1">{cluster.name}</div>
                <div className="text-xs text-slate-500 mb-2">
                  {cluster.posts.length} question{cluster.posts.length !== 1 ? "s" : ""}
                </div>
                <Link className="text-xs text-blue-600 underline" href={`/locations/${cluster.slug}`}>
                  Open location feed
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating panel */}
      {selectedCluster && (
        <div className="absolute top-4 right-4 z-[1000] w-80 max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl border border-breach-border bg-breach-dark/95 shadow-2xl backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-breach-border shrink-0">
            <div>
              <p className="text-sm font-semibold text-breach-text">{selectedCluster.name}</p>
              {selectedCluster.city && (
                <p className="text-xs text-breach-text-muted">{selectedCluster.city}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedSlug(null)}
              className="text-breach-text-muted hover:text-breach-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto p-2 flex-1">
            <ul className="space-y-1">
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
                    </span>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-breach-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 border-t border-breach-border shrink-0">
            <Link
              href={`/locations/${selectedCluster.slug}`}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-breach-orange hover:bg-breach-orange-dark text-white text-sm font-medium py-2 transition-colors"
            >
              View location feed
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
