import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button">;

export function Button({
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`border-line text-ink hover:border-brand hover:text-brand inline-flex min-h-11 items-center justify-center rounded-full border bg-white px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type={type}
      {...props}
    />
  );
}
