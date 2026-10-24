import { useId, type ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  action,
  className = "",
  description,
  title,
}: EmptyStateProps) {
  const titleId = useId();

  return (
    <section
      className={`rounded-panel border-border bg-surface border border-dashed px-6 py-12 text-center sm:px-10 ${className}`.trim()}
      aria-labelledby={titleId}
    >
      <div
        aria-hidden="true"
        className="bg-brand-50 text-brand-700 mx-auto mb-5 flex size-14 items-center justify-center rounded-full"
      >
        <svg fill="none" viewBox="0 0 24 24" className="size-6">
          <path
            d="M4 7.5h16M6.5 7.5l1 11h9l1-11M9 7.5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      </div>
      <h2
        className="text-ink text-xl leading-7 font-semibold tracking-tight"
        id={titleId}
      >
        {title}
      </h2>
      <p className="text-muted mx-auto mt-2 max-w-md text-sm leading-6">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
