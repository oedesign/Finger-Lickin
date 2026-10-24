import type { ComponentProps } from "react";

export type SelectProps = ComponentProps<"select">;

export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={`border-border bg-surface text-ink shadow-ink/3 hover:border-leaf-300 focus-visible:border-focus-ring focus-visible:ring-focus-ring/20 disabled:bg-surface-soft disabled:text-muted min-h-12 w-full rounded-xl border px-4 py-3 text-base shadow-sm transition-[border-color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-80 ${className}`.trim()}
      {...props}
    />
  );
}
