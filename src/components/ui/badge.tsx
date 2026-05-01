import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variant === "success" && "bg-green-500/20 text-green-300 border border-green-500/20",
        variant === "warning" && "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20",
        variant === "danger" && "bg-red-500/20 text-red-300 border border-red-500/20",
        variant === "info" && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/20",
        variant === "neutral" && "bg-white/10 text-gray-300 border border-white/10",
        variant === "purple" && "bg-purple-500/20 text-purple-300 border border-purple-500/20",
        className
      )}
    >
      {children}
    </span>
  );
}
