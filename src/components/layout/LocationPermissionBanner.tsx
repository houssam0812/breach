"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MIN_MOVE_METRES = 200;

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function LocationPermissionBanner() {
  const { data: session, status, update: updateSession } = useSession();
  const [visible, setVisible] = useState(false);
  const lastSent = useRef<{ lat: number; lng: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    // Always check the real DB state — avoids stale JWT and stale localStorage
    fetch("/api/user/location")
      .then((r) => r.json())
      .then(({ hasLocation }: { hasLocation: boolean }) => {
        if (hasLocation) {
          // Already stored — silently refresh if moved >200m
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
              const { latitude: lat, longitude: lng } = pos.coords;
              const prev = lastSent.current;
              if (!prev || haversineMeters(prev.lat, prev.lng, lat, lng) > MIN_MOVE_METRES) {
                lastSent.current = { lat, lng };
                fetch("/api/user/location", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ lat, lng }),
                });
              }
            });
          }
          return;
        }
        // No location in DB — show banner (ignore previous dismissal)
        setVisible(true);
      })
      .catch(() => {/* ignore network errors */});
  }, [status]);

  function handleAllow() {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        lastSent.current = { lat, lng };
        fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        }).then(() => {
          updateSession();
          router.refresh();
        });
        setVisible(false);
      },
      () => {
        // Permission denied or error — dismiss banner
        localStorage.setItem(STORAGE_KEY, "denied");
        setVisible(false);
      }
    );
  }

  function handleDismiss() {
    // Hide for this session only — will re-prompt on next login until location is saved
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-[76px] md:bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-breach-card border border-breach-border rounded-xl shadow-lg p-4 flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold text-breach-text">
            See questions near you
          </p>
          <p className="text-xs text-breach-text-muted mt-1">
            Breach shows questions from your neighbourhood. Share your location
            to unlock the local feed.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAllow}
            className="flex-1 bg-breach-orange text-white text-xs font-medium rounded-full py-2 hover:opacity-90 transition-opacity"
          >
            Share location
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 border border-breach-border text-breach-text-muted text-xs font-medium rounded-full py-2 hover:text-breach-text transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
