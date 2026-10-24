import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Finger-Lickin design preview", () => {
  it("introduces the marketplace and makes the preview status clear", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A little closer to good food.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("A marketplace in the making")).toBeInTheDocument();
    expect(
      screen.getByText(/does not accept orders or account details/i),
    ).toBeInTheDocument();
  });

  it("provides distinct customer, restaurant, and operations foundations", () => {
    render(<Home />);

    const workspaces = screen.getByRole("region", {
      name: "A place for everyone who makes it happen.",
    });

    expect(within(workspaces).getByText("For customers")).toBeInTheDocument();
    expect(
      within(workspaces).getByText("For restaurant teams"),
    ).toBeInTheDocument();
    expect(within(workspaces).getByText("For operations")).toBeInTheDocument();
  });
});
