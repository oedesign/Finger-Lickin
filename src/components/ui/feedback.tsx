import type { ComponentProps, ReactNode } from "react";

export type FeedbackVariant = "info" | "success" | "warning" | "danger";

const variantClasses: Record<FeedbackVariant, string> = {
  info: "border-info-ink/20 bg-info-surface text-info-ink",
  success: "border-success-ink/20 bg-success-surface text-success-ink",
  warning: "border-warning-ink/20 bg-warning-surface text-warning-ink",
  danger: "border-danger-ink/20 bg-danger-surface text-danger-ink",
};

const variantLabels: Record<FeedbackVariant, string> = {
  info: "Information",
  success: "Success",
  warning: "Attention",
  danger: "Error",
};

type FeedbackProps = Omit<ComponentProps<"div">, "title"> & {
  variant?: FeedbackVariant;
  title?: string;
  children: ReactNode;
};

export function Feedback({
  children,
  className = "",
  title,
  variant = "info",
  ...props
}: FeedbackProps) {
  const isError = variant === "danger";

  return (
    <div
      className={`flex gap-3 rounded-xl border p-4 ${variantClasses[variant]} ${className}`.trim()}
      {...props}
      role={isError ? "alert" : "status"}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-xs leading-none font-bold"
      >
        {variant === "success"
          ? "✓"
          : variant === "warning" || isError
            ? "!"
            : "i"}
      </span>
      <div className="grid gap-1">
        <p className="text-sm leading-5 font-semibold">
          {title ?? variantLabels[variant]}
        </p>
        <div className="text-sm leading-6">{children}</div>
      </div>
    </div>
  );
}
