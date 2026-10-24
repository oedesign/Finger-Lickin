import type { ComponentProps } from "react";

export type RadioProps = ComponentProps<"input">;

export function Radio({ className = "", ...props }: RadioProps) {
  return (
    <input
      className={`accent-brand-700 focus-visible:outline-focus-ring size-5 shrink-0 cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${className}`.trim()}
      {...props}
      type="radio"
    />
  );
}
