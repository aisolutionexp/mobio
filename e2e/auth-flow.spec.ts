import { test, expect } from "@playwright/test";

test.describe("Auth Flow — Login", () => {
  test("pagina /entrar carrega com formulario de email", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Receber link" }),
    ).toBeVisible();
  });

  test("exibe link para cadastro de lojista e atelier", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByRole("link", { name: /loja/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /ateliê/i })).toBeVisible();
  });

  test("formulario valida email obrigatorio", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByRole("button", { name: "Receber link" }).click();
    await expect(page.getByLabel("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("submete magic link com email valido (sem backend real)", async ({
    page,
  }) => {
    await page.route("**/auth/v1/otp*", (route) =>
      route.fulfill({ status: 200, body: "{}" }),
    );

    await page.goto("/entrar");
    await page.getByLabel("Email").fill("teste@exemplo.com");
    await page.getByRole("button", { name: "Receber link" }).click();

    await expect(page.getByText("Verifique sua caixa de entrada")).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Auth Flow — Cadastro Fabrica", () => {
  test("pagina /cadastro/fabrica carrega com formulario completo", async ({
    page,
  }) => {
    await page.goto("/cadastro/fabrica");
    await expect(
      page.getByRole("heading", { name: /cadastro de ateliê/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Nome do Ateliê")).toBeVisible();
    await expect(page.getByLabel("CNPJ")).toBeVisible();
    await expect(page.getByLabel("Nome do Responsável")).toBeVisible();
    await expect(page.getByLabel("Região")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Criar conta" }),
    ).toBeVisible();
  });

  test("valida campos obrigatorios ao submeter vazio", async ({ page }) => {
    await page.goto("/cadastro/fabrica");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByLabel("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

test.describe("Auth Flow — Cadastro Lojista", () => {
  test("pagina /cadastro/lojista carrega com formulario completo", async ({
    page,
  }) => {
    await page.goto("/cadastro/lojista");
    await expect(
      page.getByRole("heading", { name: /cadastro de lojista/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Nome da Loja")).toBeVisible();
    await expect(page.getByLabel("Nome do Responsável")).toBeVisible();
    await expect(page.getByLabel("Região")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Criar conta" }),
    ).toBeVisible();
  });

  test("valida campos obrigatorios ao submeter vazio", async ({ page }) => {
    await page.goto("/cadastro/lojista");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByLabel("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
