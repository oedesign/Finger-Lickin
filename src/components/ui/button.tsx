import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "inverse" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "border-leaf-800 bg-leaf-800 text-white shadow-sm hover:bg-leaf-900 active:bg-ink",
  outline:
    "border-border bg-surface text-ink hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 active:bg-brand-100",
  inverse:
    "border-white/25 bg-white/10 text-white hover:border-white/50 hover:bg-white/20 active:bg-white/25",
  ghost:
    "border-transparent bg-transparent text-ink hover:bg-surface-soft active:bg-border",
  danger:
    "border-transparent bg-danger-ink text-white shadow-sm hover:bg-red-900 active:bg-red-950",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 gap-2 px-4 text-sm",
  md: "min-h-11 gap-2.5 px-5 text-sm",
  lg: "min-h-13 gap-3 px-6 text-base",
  icon: "size-11 p-0",
};

const baseClasses =
  "inline-flex shrink-0 items-center justify-center rounded-full border font-semibold transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
};

function ButtonSpinner() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 animate-spin motion-reduce:animate-none"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function Button({
  children,
  className,
  loading = false,
  loadingLabel = "Loading",
  size = "md",
  type = "button",
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <>
      <button
        className={buttonStyles({ variant, size, className })}
        disabled={disabled || loading}
        type={type}
        {...props}
        aria-busy={loading || undefined}
      >
        {children}
        {loading ? <ButtonSpinner /> : null}
      </button>
      {loading ? (
        <span aria-label={loadingLabel} className="sr-only" role="status">
          {loadingLabel}
        </span>
      ) : null}
    </>
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
