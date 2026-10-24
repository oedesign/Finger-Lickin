import type { ReactNode } from "react";

export type FormControlProps = {
  id: string;
  required: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: FormControlProps) => ReactNode;
};

export function FormField({
  children,
  error,
  hint,
  id,
  label,
  required = false,
}: FormFieldProps) {
  const descriptionIds = [
    hint ? `${id}-hint` : undefined,
    error ? `${id}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label className="text-ink text-sm font-semibold" htmlFor={id}>
          {label}
        </label>
        {required ? (
          <span className="text-muted text-xs font-medium">Required</span>
        ) : null}
      </div>
      {children({
        id,
        required,
        "aria-describedby": descriptionIds || undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {hint ? (
        <p className="text-muted text-sm leading-5" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          className="text-danger-ink flex items-start gap-2 text-sm leading-5 font-medium"
          id={`${id}-error`}
          role="alert"
        >
          <svg
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 6.5v4m0 3h.01M8.27 3.94 1.9 15a1.5 1.5 0 0 0 1.3 2.25h13.6a1.5 1.5 0 0 0 1.3-2.25L11.73 3.94a2 2 0 0 0-3.46 0Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
