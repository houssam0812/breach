"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-breach-orange font-bold text-2xl mb-2">
            <MapPin className="w-7 h-7" />
            breach
          </div>
          <p className="text-breach-text-muted text-sm">
            Sign in to your account
          </p>
        </div>

        <div className="bg-breach-card border border-breach-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-breach-text mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-breach-text mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors"
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-breach-text-muted mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-breach-blue-light hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
