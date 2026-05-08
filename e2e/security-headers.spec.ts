import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  let headers: Record<string, string>;

  test.beforeAll(async ({ request }) => {
    const response = await request.get("/");
    headers = Object.fromEntries(
      Object.entries(response.headers()).map(([k, v]) => [k.toLowerCase(), v]),
    );
  });

  test("Content-Security-Policy esta presente (enforce, nao report-only)", async () => {
    expect(headers["content-security-policy"]).toBeDefined();
    expect(headers["content-security-policy-report-only"]).toBeUndefined();
  });

  test("CSP inclui diretivas essenciais", async () => {
    const csp = headers["content-security-policy"];
    expect(csp).toContain("default-src");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
  });

  test("X-Frame-Options DENY", async () => {
    expect(headers["x-frame-options"]).toBe("DENY");
  });

  test("X-Content-Type-Options nosniff", async () => {
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("Strict-Transport-Security presente com preload", async () => {
    const hsts = headers["strict-transport-security"];
    expect(hsts).toBeDefined();
    expect(hsts).toContain("max-age=");
    expect(hsts).toContain("includeSubDomains");
    expect(hsts).toContain("preload");
  });

  test("Referrer-Policy configurado", async () => {
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("Permissions-Policy presente", async () => {
    const pp = headers["permissions-policy"];
    expect(pp).toBeDefined();
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
  });
});
