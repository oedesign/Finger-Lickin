import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the design preview with clear marketplace boundaries", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A little closer to good food.",
    }),
  ).toBeVisible();
  await expect(page.getByText("A marketplace in the making")).toBeVisible();
  await expect(page.getByText("Foundation preview")).toBeVisible();
  await expect(page).toHaveTitle("Finger-Lickin");
});

test("supports keyboard navigation and a modal dialog", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  const menu = page.getByText("Menu", { exact: true });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#mobile-navigation")).toBeVisible();

  const dialogTrigger = page.getByRole("button", {
    name: "About this preview",
  });
  await dialogTrigger.click();
  const dialog = page.getByRole("dialog", { name: "A thoughtful start" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("not a live ordering service");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(dialogTrigger).toBeFocused();
});

test("has no horizontal overflow at mobile, tablet, or desktop widths", async ({
  page,
}) => {
  await page.goto("/");

  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "A little closer to good food.",
      }),
    ).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));

    expect(
      dimensions.document,
      `horizontal overflow at ${width}px`,
    ).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("meets automated accessibility checks on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/");

  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations.map(({ id, impact, help, nodes }) => ({
        id,
        impact,
        help,
        elements: nodes.map(({ target }) => target),
      })),
    ).toEqual([]);
  }
});

test("maintains accessible naming and focus when the modal is open", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About this preview" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(
    results.violations.map(({ id, impact, help }) => ({ id, impact, help })),
  ).toEqual([]);
});
