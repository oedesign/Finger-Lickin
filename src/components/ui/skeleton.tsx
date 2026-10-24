import type { ComponentProps } from "react";

export function Skeleton({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`bg-surface-soft rounded-lg motion-safe:animate-pulse ${className}`.trim()}
      {...props}
      aria-hidden="true"
    />
  );
}
