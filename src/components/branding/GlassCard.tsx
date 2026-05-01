import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}

export function GlassCard({ children, className, padding = "md" }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl shadow-2xl shadow-black/40",
        padding === "none" && "p-0",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
