import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "reading";
};

export function PageContainer({
  children,
  className = "",
  size = "default",
}: PageContainerProps) {
  return (
    <div
      className={`${size === "reading" ? "reading-container" : "page-container"} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  align = "left",
  className = "",
  description,
  eyebrow,
  id,
  title,
}: SectionHeadingProps) {
  return (
    <div
      className={`grid gap-4 ${align === "center" ? "mx-auto max-w-3xl justify-items-center text-center" : "max-w-3xl"} ${className}`.trim()}
    >
      {eyebrow ? (
        <p className="text-brand-700 text-xs leading-5 font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-section text-ink" id={id}>
        {title}
      </h2>
      {description ? (
        <p className="text-muted sm:text-body-lg max-w-2xl text-base leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}
