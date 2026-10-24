import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AdminDashboardLayout,
  PartnerPortalLayout,
} from "@/components/shared/workspace-layouts";

const navigation = [
  { href: "/overview", label: "Overview" },
  { href: "/orders", label: "Orders" },
];

describe("shared workspace shells", () => {
  it("keeps restaurant navigation in a distinct, navigable partner shell", () => {
    render(
      <PartnerPortalLayout currentHref="/overview" navigation={navigation}>
        <h1>Restaurant workspace</h1>
      </PartnerPortalLayout>,
    );

    expect(
      screen.getByRole("link", { name: "Finger-Lickin home" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Restaurant partner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Restaurant workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Overview" })[0],
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getAllByRole("navigation", {
        name: "Restaurant partner navigation",
      }),
    ).toHaveLength(2);
  });

  it("keeps platform navigation separate and marks the active destination", () => {
    render(
      <AdminDashboardLayout currentHref="/orders" navigation={navigation}>
        <h1>Operations workspace</h1>
      </AdminDashboardLayout>,
    );

    const navigationLandmarks = screen.getAllByRole("navigation", {
      name: "Platform administration navigation",
    });

    expect(screen.getByText("Platform operations")).toBeInTheDocument();
    expect(navigationLandmarks).toHaveLength(2);
    expect(
      within(navigationLandmarks[0]).getByRole("link", { name: "Orders" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("main")).toHaveAttribute("id", "workspace-main");
  });
});
