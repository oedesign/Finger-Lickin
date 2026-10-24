import type { ComponentProps } from "react";

export type BadgeVariant =
  "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-border bg-surface-soft text-muted",
  brand: "border-brand-200 bg-brand-50 text-brand-800",
  success: "border-success-ink/15 bg-success-surface text-success-ink",
  warning: "border-warning-ink/15 bg-warning-surface text-warning-ink",
  danger: "border-danger-ink/15 bg-danger-surface text-danger-ink",
  info: "border-info-ink/15 bg-info-surface text-info-ink",
};

type BadgeProps = ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

export function Badge({
  children,
  className = "",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs leading-4 font-semibold ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
