"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X } from "lucide-react";

export interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    suburb?: string;
    neighbourhood?: string;
    district?: string;
    borough?: string;
  };
}

interface LocationPickerProps {
  value: NominatimResult | null;
  onChange: (location: NominatimResult | null) => void;
  placeholder?: string;
}

export function LocationPicker({
  value,
  onChange,
  placeholder = "Search for a location…",
}: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(result: NominatimResult) {
    onChange(result);
    setQuery(result.name || result.display_name.split(",")[0]);
    setIsOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-breach-text-muted" />
        <input
          type="text"
          value={value ? (value.name || value.display_name.split(",")[0]) : query}
          onChange={(e) => {
            if (value) onChange(null);
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-breach-dark border border-breach-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue transition-colors"
        />
        {(value || query) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-breach-text-muted hover:text-breach-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-breach-blue border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-breach-card border border-breach-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full text-left px-3 py-2.5 hover:bg-breach-dark/60 transition-colors flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-breach-orange mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm text-breach-text block truncate">
                    {result.name || result.display_name.split(",")[0]}
                  </span>
                  <span className="text-xs text-breach-text-muted truncate block">
                    {result.display_name}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-breach-card border border-breach-border rounded-lg shadow-xl p-3">
          <p className="text-sm text-breach-text-muted text-center">
            No locations found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
