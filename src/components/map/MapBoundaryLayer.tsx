"use client";

import { useEffect, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";

const BOUNDARY_MIN_ZOOM = 11;

export function MapBoundaryLayer() {
  const map = useMap();
  const [geojson, setGeojson] = useState<object | null>(null);
  const [geojsonKey, setGeojsonKey] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const fetchBoundaries = () => {
      if (map.getZoom() < BOUNDARY_MIN_ZOOM) {
        setGeojson(null);
        return;
      }
      const b = map.getBounds();
      const params = new URLSearchParams({
        south: b.getSouth().toFixed(6),
        west: b.getWest().toFixed(6),
        north: b.getNorth().toFixed(6),
        east: b.getEast().toFixed(6),
      });
      fetch(`/api/geocode/boundaries?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setGeojson(data);
          setGeojsonKey((k) => k + 1);
        })
        .catch(() => {});
    };

    const debouncedFetch = () => {
      clearTimeout(timer);
      timer = setTimeout(fetchBoundaries, 600);
    };

    fetchBoundaries();
    map.on("moveend", debouncedFetch);
    map.on("zoomend", debouncedFetch);
    return () => {
      clearTimeout(timer);
      map.off("moveend", debouncedFetch);
      map.off("zoomend", debouncedFetch);
    };
  }, [map]);

  if (!geojson) return null;

  return (
    <GeoJSON
      key={geojsonKey}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data={geojson as any}
      style={{
        color: "#f7741e",
        weight: 1.5,
        opacity: 0.7,
        fillColor: "#f7741e",
        fillOpacity: 0.08,
      }}
    />
  );
}
