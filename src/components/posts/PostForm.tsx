"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LocationPicker } from "@/components/locations/LocationPicker";
import type { NominatimResult } from "@/components/locations/LocationPicker";

export function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("general");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState<NominatimResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location) {
      setError("Please select a location for your question.");
      return;
    }
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (topic.trim().length < 2) {
      setError("Topic must be at least 2 characters.");
      return;
    }
    if (body.trim().length < 5) {
      setError("Question body must be at least 5 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          topic: topic.trim().toLowerCase(),
          body: body.trim(),
          location: {
            name: location.name,
            address: location.display_name,
            city: location.address?.city || location.address?.town || location.address?.village || null,
            country: location.address?.country || null,
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon),
            suburb: location.address?.suburb || location.address?.district || location.address?.borough || null,
            neighbourhood: location.address?.neighbourhood || null,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      const post = await res.json();
      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-breach-text mb-1.5"
        >
          Question title
          <span className="text-breach-text-muted font-normal ml-1 text-xs">
            ({title.length}/300)
          </span>
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={300}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to know about this place?"
          className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors"
        />
      </div>

      {/* Topic */}
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-breach-text mb-1.5"
        >
          Topic
        </label>
        <input
          id="topic"
          type="text"
          required
          maxLength={40}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. safety, nightlife, food, transport"
          list="topic-suggestions"
          className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors"
        />
        <datalist id="topic-suggestions">
          <option value="general" />
          <option value="safety" />
          <option value="food" />
          <option value="nightlife" />
          <option value="transport" />
          <option value="cost" />
          <option value="accessibility" />
        </datalist>
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-breach-text mb-1.5"
        >
          Details
        </label>
        <textarea
          id="body"
          required
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Provide more context about what you're looking for…"
          className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors resize-y"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-breach-text mb-1.5">
          Location
        </label>
        <LocationPicker
          value={location}
          onChange={setLocation}
          placeholder="Search for a place, bar, neighborhood…"
        />
        {location && (
          <p className="mt-1.5 text-xs text-breach-text-muted">
            📍 {location.display_name}
          </p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        Post question
      </Button>
    </form>
  );
}
