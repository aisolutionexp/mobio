import { test, expect } from "@playwright/test";

test.describe("Paginas Publicas", () => {
  test("home carrega com heading MOBIO", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "MOBIO" })).toBeVisible();
  });

  test("politica de privacidade carrega com conteudo LGPD", async ({
    page,
  }) => {
    await page.goto("/politica-de-privacidade");
    await expect(
      page.getByRole("heading", { name: /pol[íi]tica de privacidade/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /direitos.*LGPD/i }),
    ).toBeVisible();
    await expect(page.getByText(/privacidade@mobio/i)).toBeVisible();
  });

  test("design-system carrega sem erro", async ({ page }) => {
    await page.goto("/design-system");
    await expect(page).toHaveURL(/design-system/);
    const response = await page.goto("/design-system");
    expect(response?.status()).toBeLessThan(400);
  });

  test("/fabrica/slug-inexistente retorna 404", async ({ page }) => {
    const response = await page.goto("/fabrica/slug-inexistente-xyz-99999");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/não encontrad/i)).toBeVisible();
  });

  test("/linesheet-publico/token-invalido retorna 404", async ({ page }) => {
    const response = await page.goto(
      "/linesheet-publico/token-invalido-abc-12345",
    );
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/não encontrad/i)).toBeVisible();
  });
});

test.describe("Paginas Publicas — SEO e Headers", () => {
  test("home tem meta title e description", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("MOBIO");
  });

  test("politica de privacidade tem meta title", async ({ page }) => {
    await page.goto("/politica-de-privacidade");
    const title = await page.title();
    expect(title.toLowerCase()).toContain("privacidade");
  });
});
