import { test, expect } from "@playwright/test";

test.describe("Signup consent", () => {
  test("requires accepting Terms and Privacy", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByText("Create your account", { exact: true })).toBeVisible();

    const checkbox = page.getByRole("checkbox", {
      name: "I accept the Terms of Service and Privacy Policy",
    });
    const submitButton = page.getByRole("button", { name: "Create account" });

    await expect(checkbox).not.toBeChecked();
    await expect(submitButton).toBeDisabled();

    await checkbox.click();

    await expect(checkbox).toBeChecked();
    await expect(submitButton).toBeEnabled();

    const termsLink = page.getByRole("link", { name: "Terms of Service" });
    const privacyLink = page.getByRole("link", { name: "Privacy Policy" });

    await expect(termsLink).toHaveAttribute("href", "/terms");
    await expect(privacyLink).toHaveAttribute("href", "/privacy");
    await expect(termsLink).toHaveAttribute("target", "_blank");
    await expect(privacyLink).toHaveAttribute("target", "_blank");
  });
});
