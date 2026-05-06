import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-white/8 border-white/15 px-4 py-2.5 text-sm text-white placeholder-gray-500",
        "focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/30",
        "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        "dark:bg-white/8 dark:border-white/15 dark:text-white dark:placeholder-gray-500",
        "light:bg-gray-50 light:border-gray-200 light:text-gray-900 light:placeholder-gray-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
