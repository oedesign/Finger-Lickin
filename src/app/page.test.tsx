import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("foundation page", () => {
  it("renders the brand and clearly labels the unfinished storefront", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Finger-Lickin" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Storefront coming soon" }),
    ).toBeDisabled();
  });
});
