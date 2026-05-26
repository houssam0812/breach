import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-breach-blue focus:ring-offset-2 focus:ring-offset-breach-dark disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-breach-orange hover:bg-breach-orange-dark text-white",
      secondary:
        "bg-breach-card hover:bg-breach-border text-breach-text border border-breach-border",
      ghost:
        "text-breach-text-muted hover:text-breach-text hover:bg-breach-card",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      outline:
        "border border-breach-orange text-breach-orange hover:bg-breach-orange hover:text-white",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
