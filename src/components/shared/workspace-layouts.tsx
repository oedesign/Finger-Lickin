import type { ReactNode } from "react";
import { Brand } from "@/components/shared/brand";

export type WorkspaceNavigationItem = {
  href: string;
  label: string;
};

type WorkspaceArea = "partner" | "admin";

type WorkspaceLayoutProps = {
  children: ReactNode;
  navigation: WorkspaceNavigationItem[];
  currentHref?: string;
};

const workspaceCopy: Record<
  WorkspaceArea,
  { label: string; navLabel: string; accent: string; surface: string }
> = {
  partner: {
    label: "Restaurant partner",
    navLabel: "Restaurant partner navigation",
    accent: "text-leaf-700",
    surface: "bg-leaf-50",
  },
  admin: {
    label: "Platform operations",
    navLabel: "Platform administration navigation",
    accent: "text-brand-700",
    surface: "bg-brand-50",
  },
};

function WorkspaceNavigation({
  area,
  currentHref,
  navigation,
}: {
  area: WorkspaceArea;
  currentHref?: string;
  navigation: WorkspaceNavigationItem[];
}) {
  const copy = workspaceCopy[area];

  return (
    <nav aria-label={copy.navLabel}>
      <ul className="grid gap-1">
        {navigation.map((item) => {
          const active = item.href === currentHref;

          return (
            <li key={item.href}>
              <a
                aria-current={active ? "page" : undefined}
                className={`focus-visible:outline-focus-ring flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-3 ${
                  active
                    ? `${copy.surface} ${copy.accent}`
                    : "text-muted hover:bg-surface-soft hover:text-ink"
                }`}
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function WorkspaceLayout({
  area,
  children,
  currentHref,
  navigation,
}: WorkspaceLayoutProps & { area: WorkspaceArea }) {
  const copy = workspaceCopy[area];

  return (
    <div className="bg-canvas min-h-screen">
      <a className="skip-link" href="#workspace-main">
        Skip to workspace content
      </a>
      <header className="border-border bg-surface border-b">
        <div className="page-container flex min-h-18 items-center justify-between gap-5 py-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Brand size="sm" />
            <span
              aria-hidden="true"
              className="bg-border hidden h-8 w-px sm:block"
            />
            <p className={`truncate text-sm font-semibold ${copy.accent}`}>
              {copy.label}
            </p>
          </div>
          <p className="text-muted hidden text-xs font-medium sm:block">
            Finger-Lickin workspace
          </p>
        </div>
      </header>
      <div className="page-container grid gap-5 py-5 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-8 md:py-8">
        <details className="group relative md:hidden">
          <summary className="border-border bg-surface text-ink focus-visible:outline-focus-ring flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl border px-4 text-sm font-semibold shadow-sm focus-visible:outline-3 [&::-webkit-details-marker]:hidden">
            <span>Open navigation</span>
            <svg
              aria-hidden="true"
              className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="m5 7.5 5 5 5-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </summary>
          <div className="rounded-card border-border bg-surface shadow-panel absolute z-10 mt-2 w-full border p-3">
            <WorkspaceNavigation
              area={area}
              currentHref={currentHref}
              navigation={navigation}
            />
          </div>
        </details>
        <aside className="rounded-card border-border bg-surface hidden border p-3 shadow-sm md:block">
          <WorkspaceNavigation
            area={area}
            currentHref={currentHref}
            navigation={navigation}
          />
        </aside>
        <main
          className="rounded-card border-border bg-surface min-h-[60vh] min-w-0 border p-5 shadow-sm sm:p-8"
          id="workspace-main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function PartnerPortalLayout(props: WorkspaceLayoutProps) {
  return <WorkspaceLayout {...props} area="partner" />;
}

export function AdminDashboardLayout(props: WorkspaceLayoutProps) {
  return <WorkspaceLayout {...props} area="admin" />;
}
