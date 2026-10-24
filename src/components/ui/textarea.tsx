import type { ComponentProps } from "react";

export type TextareaProps = ComponentProps<"textarea">;

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`border-border bg-surface text-ink shadow-ink/3 placeholder:text-subtle hover:border-leaf-300 focus-visible:border-focus-ring focus-visible:ring-focus-ring/20 disabled:bg-surface-soft disabled:text-muted min-h-32 w-full resize-y rounded-xl border px-4 py-3 text-base leading-6 shadow-sm transition-[border-color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-80 ${className}`.trim()}
      {...props}
    />
  );
}
