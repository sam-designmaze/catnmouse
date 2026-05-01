"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" && "text-xs px-3 py-1.5 gap-1.5",
          size === "md" && "text-sm px-4 py-2 gap-2",
          size === "lg" && "text-base px-6 py-3 gap-2",
          variant === "primary" &&
            "bg-[var(--tenant-primary)] text-white hover:opacity-90 shadow-lg",
          variant === "ghost" &&
            "text-gray-300 hover:bg-white/10 hover:text-white",
          variant === "outline" &&
            "border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30",
          variant === "danger" &&
            "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
