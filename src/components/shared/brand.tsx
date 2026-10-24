import Link from "next/link";

type BrandProps = {
  className?: string;
  href?: string;
  size?: "sm" | "md";
};

export function Brand({ className = "", href = "/", size = "md" }: BrandProps) {
  const markSize = size === "sm" ? "size-9" : "size-11";
  const textSize = size === "sm" ? "text-lg" : "text-xl";

  return (
    <Link
      aria-label="Finger-Lickin home"
      className={`inline-flex min-h-11 items-center gap-2.5 rounded-lg ${className}`.trim()}
      href={href}
    >
      <span
        aria-hidden="true"
        className={`bg-brand-700 flex shrink-0 items-center justify-center rounded-2xl text-white ${markSize}`}
      >
        <svg className="size-6" fill="none" viewBox="0 0 32 32">
          <path
            d="M7 17.5c0 5.25 4.03 9 9 9s9-3.75 9-9H7Z"
            fill="currentColor"
          />
          <path
            d="M8.5 14.5c1.1-4.03 3.65-6.25 7.5-6.25 3.86 0 6.42 2.22 7.5 6.25M10.5 5.9l1.1 1.4m3.9-3.05v1.9m5.1-.25-1.1 1.4M7 17.5h18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M11.5 19.5c1.2 1.1 2.7 1.1 3.9 0s2.7-1.1 3.9 0 2.7 1.1 3.9 0"
            stroke="#F7D583"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span
        className={`font-display text-ink leading-none font-bold tracking-tight ${textSize}`}
      >
        Finger-Lickin
      </span>
    </Link>
  );
}
