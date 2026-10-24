import type { ComponentProps } from "react";

export type CheckboxProps = ComponentProps<"input">;

export function Checkbox({ className = "", ...props }: CheckboxProps) {
  return (
    <input
      className={`border-border accent-brand-700 focus-visible:outline-focus-ring size-5 shrink-0 cursor-pointer rounded focus-visible:outline-3 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${className}`.trim()}
      {...props}
      type="checkbox"
    />
  );
}
