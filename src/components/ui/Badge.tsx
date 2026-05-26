import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "location" | "new";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-breach-card text-breach-text-muted border border-breach-border",
    location: "bg-breach-blue/10 text-breach-blue-light border border-breach-blue/20",
    new: "bg-breach-orange/10 text-breach-orange border border-breach-orange/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
