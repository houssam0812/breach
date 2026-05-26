"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(
            Object.fromEntries(
              Object.entries(data.details).map(([k, v]) => [
                k,
                (v as string[])[0],
              ])
            )
          );
        } else {
          setErrors({ general: data.error || "Registration failed" });
        }
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
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
            Create your account
          </p>
        </div>

        <div className="bg-breach-card border border-breach-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
                {errors.general}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-breach-text mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. explorer42"
                className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">{errors.username}</p>
              )}
            </div>

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
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-breach-text mb-1.5"
              >
                Password
                <span className="text-breach-text-muted font-normal text-xs ml-1">
                  (min. 8 characters)
                </span>
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-breach-dark border border-breach-border rounded-lg px-4 py-2.5 text-breach-text placeholder:text-breach-text-muted focus:outline-none focus:border-breach-blue text-sm transition-colors"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-breach-text-muted mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-breach-blue-light hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
