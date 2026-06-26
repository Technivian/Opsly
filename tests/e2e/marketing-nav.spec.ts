import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the Aurivian corporate site: each route renders, the primary
 * navigation and CTA work, the footer carries the correct legal attribution,
 * and corporate pages are reachable without authentication.
 */

const routes: { path: string; testId: string }[] = [
  { path: "/", testId: "button-hero-primary" },
  { path: "/services", testId: "button-services-cta" },
  { path: "/products", testId: "button-products-opsly" },
  { path: "/products/opsly", testId: "button-opsly-cta" },
  { path: "/approach", testId: "button-approach-cta" },
  { path: "/experience", testId: "link-brand-home" },
  { path: "/about", testId: "button-about-cta" },
  { path: "/contact", testId: "button-contact-submit" },
];

test.describe("Aurivian corporate site", () => {
  for (const route of routes) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByTestId("link-brand-home")).toBeVisible();
      await expect(page.getByTestId(route.testId).first()).toBeVisible();
      // Footer legal attribution is present on every page.
      await expect(
        page.getByText("Aurivian B.V.", { exact: false }).first()
      ).toBeVisible();
    });
  }

  test("primary navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("link-nav-services").click();
    await expect(page).toHaveURL(/\/services$/);
    await page.getByTestId("link-nav-products").click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test("header CTA goes to contact", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("button-header-cta").click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("featured product links to the Opsly product page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("button-featured-opsly").click();
    await expect(page).toHaveURL(/\/products\/opsly$/);
  });

  test("contact form requires fields before opening mail client", async ({ page }) => {
    await page.goto("/contact");
    await page.getByTestId("button-contact-submit").click();
    // Validation messages appear; no navigation to a mailto occurs.
    await expect(page.getByTestId("input-contact-name")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
});
