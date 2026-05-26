"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
  locationSlug: string;
  isSubscribed: boolean;
  subscriberCount: number;
}

export function SubscribeButton({
  locationSlug,
  isSubscribed: initialSubscribed,
  subscriberCount: initialCount,
}: SubscribeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    if (!session) {
      router.push("/login");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    // Optimistic
    setIsSubscribed(!isSubscribed);
    setCount((c) => (isSubscribed ? c - 1 : c + 1));

    try {
      const res = await fetch(`/api/locations/${locationSlug}/subscribe`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setIsSubscribed(data.subscribed);
      setCount(data.subscriberCount);
    } catch {
      setIsSubscribed(isSubscribed);
      setCount(initialCount);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
        isSubscribed
          ? "bg-breach-card border border-breach-border text-breach-text hover:border-red-500 hover:text-red-400"
          : "bg-breach-orange hover:bg-breach-orange-dark text-white"
      )}
    >
      {isSubscribed ? (
        <>
          <BellOff className="w-4 h-4" />
          Subscribed
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Subscribe
        </>
      )}
      <span className="ml-1 text-xs opacity-70">{count}</span>
    </button>
  );
}
