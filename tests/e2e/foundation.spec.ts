import { expect, test } from "@playwright/test";

test("serves the Finger-Lickin application foundation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Finger-Lickin" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Storefront coming soon" }),
  ).toBeDisabled();
  await expect(page).toHaveTitle("Finger-Lickin");
});
