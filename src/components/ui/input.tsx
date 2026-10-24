import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input">;

const inputClasses =
  "min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink shadow-sm shadow-ink/3 outline-none transition-[border-color,box-shadow] placeholder:text-subtle hover:border-leaf-300 focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/20 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted disabled:opacity-80";

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`${inputClasses} ${className}`.trim()} {...props} />;
}
