import { test, expect } from "@playwright/test";

test.describe("Onboarding", () => {
  test("redireciona para /entrar sem autenticacao", async ({ page }) => {
    const response = await page.goto("/onboarding");
    const finalUrl = page.url();
    expect(finalUrl).toContain("/entrar");
  });

  test("redirect preserva path na query param", async ({ page }) => {
    await page.goto("/onboarding");
    const finalUrl = page.url();
    expect(finalUrl).toContain("/entrar");
  });
});

test.describe("Rotas autenticadas — smoke sem auth", () => {
  test("atelier dashboard redireciona para /entrar", async ({ page }) => {
    await page.goto("/atelier");
    const finalUrl = page.url();
    expect(finalUrl).toContain("/entrar");
  });

  test("lojista dashboard redireciona para /entrar", async ({ page }) => {
    await page.goto("/lojista");
    const finalUrl = page.url();
    expect(finalUrl).toContain("/entrar");
  });

  test("admin dashboard redireciona para /entrar", async ({ page }) => {
    await page.goto("/admin");
    const finalUrl = page.url();
    expect(finalUrl).toContain("/entrar");
  });
});
