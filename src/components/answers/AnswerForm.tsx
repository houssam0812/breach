"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface AnswerFormProps {
  postId: string;
  onAnswerAdded: (answer: {
    id: string;
    body: string;
    score: number;
    isAccepted: boolean;
    createdAt: string;
    author: { username: string; name: string | null };
  }) => void;
}

export function AnswerForm({ postId, onAnswerAdded }: AnswerFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="bg-breach-card border border-breach-border rounded-lg p-5 text-center">
        <p className="text-breach-text-muted text-sm mb-3">
          You need to be logged in to answer.
        </p>
        <Button onClick={() => router.push("/login")} variant="outline">
          Log in to answer
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 20) {
      setError("Answer must be at least 20 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body: body.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post answer");
      }

      const answer = await res.json();
      onAnswerAdded(answer);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <textarea
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share what you know about this place…"
        className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors resize-y"
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Post answer
        </Button>
      </div>
    </form>
  );
}
