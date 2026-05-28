"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Layers3, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/my-topics", label: "My topics", icon: Layers3 },
];

export function NavigationPanel() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-12 bottom-0 w-[88px] border-r border-breach-border bg-breach-dark/95 backdrop-blur-sm z-40 flex-col items-center py-6 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-[72px] rounded-xl px-2 py-2.5 text-xs font-medium transition-colors flex flex-col items-center gap-1.5",
                active
                  ? "bg-breach-orange text-white"
                  : "text-breach-text-muted hover:text-breach-text hover:bg-breach-card"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="leading-none text-center">{item.label}</span>
            </Link>
          );
        })}
      </aside>

      <nav className="md:hidden fixed left-0 right-0 bottom-0 z-50 border-t border-breach-border bg-breach-dark/95 backdrop-blur-sm px-2 py-2">
        <ul className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors",
                    active
                      ? "bg-breach-orange text-white"
                      : "text-breach-text-muted hover:text-breach-text hover:bg-breach-card"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}