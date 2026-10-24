import type { ComponentProps } from "react";

type CardProps = ComponentProps<"article"> & {
  interactive?: boolean;
};

export function Card({
  children,
  className = "",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <article
      className={`rounded-card border-border bg-surface shadow-card border ${
        interactive
          ? "hover:border-brand-200 hover:shadow-panel transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 motion-reduce:transform-none"
          : ""
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </article>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`grid gap-2 p-6 pb-0 sm:p-7 sm:pb-0 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: ComponentProps<"h3">) {
  return (
    <h3
      className={`text-ink text-xl leading-7 font-semibold tracking-tight ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={`text-muted text-sm leading-6 ${className}`.trim()}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={`p-6 sm:p-7 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-6 pb-6 sm:px-7 sm:pb-7 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
