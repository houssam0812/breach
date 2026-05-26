"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn, formatScore } from "@/lib/utils";

interface VoteButtonProps {
  score: number;
  userVote?: number | null; // 1, -1, or null
  targetId: string;
  targetType: "post" | "answer";
  onVote?: (newScore: number, newVote: number | null) => void;
}

export function VoteButton({
  score,
  userVote,
  targetId,
  targetType,
  onVote,
}: VoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentScore, setCurrentScore] = useState(score);
  const [currentVote, setCurrentVote] = useState<number | null>(
    userVote ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleVote(value: 1 | -1) {
    if (!session) {
      router.push("/login");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    // Optimistic update
    const isSameVote = currentVote === value;
    const scoreDelta = isSameVote ? -value : value - (currentVote ?? 0);
    const newVote = isSameVote ? null : value;

    setCurrentScore((prev) => prev + scoreDelta);
    setCurrentVote(newVote);

    try {
      const endpoint =
        targetType === "post"
          ? `/api/posts/${targetId}/vote`
          : `/api/answers/${targetId}/vote`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: isSameVote ? 0 : value }),
      });

      if (!res.ok) throw new Error("Vote failed");

      const data = await res.json();
      setCurrentScore(data.score);
      setCurrentVote(data.userVote);
      onVote?.(data.score, data.userVote);
    } catch {
      // Revert on error
      setCurrentScore(score);
      setCurrentVote(userVote ?? null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={cn(
          "p-1 rounded transition-colors",
          currentVote === 1
            ? "text-breach-orange"
            : "text-breach-text-muted hover:text-breach-orange hover:bg-breach-orange/10"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <span
        className={cn(
          "text-xs font-bold tabular-nums",
          currentVote === 1
            ? "text-breach-orange"
            : currentVote === -1
              ? "text-breach-blue-light"
              : "text-breach-text"
        )}
      >
        {formatScore(currentScore)}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={cn(
          "p-1 rounded transition-colors",
          currentVote === -1
            ? "text-breach-blue-light"
            : "text-breach-text-muted hover:text-breach-blue-light hover:bg-breach-blue/10"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
