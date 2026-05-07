import { test, expect } from "@playwright/test";

test("home page loads with MOBIO heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "MOBIO" })).toBeVisible();
});
