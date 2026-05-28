"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { MapPin, Map, PlusCircle, LogIn, LogOut, User, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-breach-dark border-b border-breach-border flex items-center px-4 gap-4">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-breach-orange font-bold text-lg shrink-0"
      >
        <MapPin className="w-5 h-5" />
        <span>breach</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-breach-text-muted" />
          <input
            type="text"
            placeholder="Search questions and locations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-breach-card border border-breach-border rounded-full pl-9 pr-4 py-1.5 text-sm text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue transition-colors"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <Link
          href="/map"
          className="flex items-center gap-1.5 text-breach-text-muted hover:text-breach-text text-sm px-2 py-1.5 rounded transition-colors"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Map</span>
        </Link>
        {session ? (
          <>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 bg-breach-orange hover:bg-breach-orange-dark text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </Link>
            <Link
              href={`/user/${session.user.username}`}
              className="flex items-center gap-1.5 text-breach-text-muted hover:text-breach-text text-sm px-2 py-1.5 rounded transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{session.user.username}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-breach-text-muted hover:text-breach-text text-sm px-2 py-1.5 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="flex items-center gap-1.5 border border-breach-orange text-breach-orange hover:bg-breach-orange hover:text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Log in</span>
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 bg-breach-orange hover:bg-breach-orange-dark text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
