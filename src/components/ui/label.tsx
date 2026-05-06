import { cn } from "@/lib/utils";
import { LabelHTMLAttributes } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-sm font-semibold text-gray-200 mb-2",
        "dark:text-gray-200 light:text-gray-700",
        className
      )}
      {...props}
    />
  );
}
