import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { ButtonLink } from "@/components/ui/button";

const navigation = [
  { href: "#our-approach", label: "Our approach" },
  { href: "#workspaces", label: "Who we serve" },
];

function NavigationLinks({ id }: { id: string }) {
  return (
    <nav aria-label="Main navigation" id={id}>
      <ul className="grid gap-1 md:flex md:items-center md:gap-7">
        {navigation.map((item) => (
          <li key={item.href}>
            <Link
              className="text-muted hover:bg-surface-soft hover:text-ink focus-visible:outline-focus-ring inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-3"
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function StorefrontHeader() {
  return (
    <header className="border-border bg-canvas relative z-20 border-b">
      <Link className="skip-link" href="#main-content">
        Skip to content
      </Link>
      <div className="page-container flex min-h-18 items-center justify-between gap-5 py-3">
        <Brand />
        <div className="hidden items-center gap-7 md:flex">
          <NavigationLinks id="desktop-navigation" />
          <ButtonLink href="#workspaces" size="sm" variant="outline">
            For restaurants
          </ButtonLink>
        </div>
        <details className="group relative md:hidden">
          <summary className="border-border bg-surface text-ink focus-visible:outline-focus-ring inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-sm focus-visible:outline-3 [&::-webkit-details-marker]:hidden">
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
            Menu
          </summary>
          <div className="rounded-card border-border bg-surface shadow-panel absolute right-0 mt-3 w-[min(19rem,calc(100vw-2.5rem))] border p-4">
            <NavigationLinks id="mobile-navigation" />
            <ButtonLink
              className="mt-3 w-full"
              href="#workspaces"
              size="sm"
              variant="outline"
            >
              For restaurants
            </ButtonLink>
          </div>
        </details>
      </div>
    </header>
  );
}
