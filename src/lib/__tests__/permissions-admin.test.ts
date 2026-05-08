import { describe, it, expect } from "vitest";
import {
  isAdmin,
  hasRole,
  resolveShell,
  canAccessTenant,
  ROLE_PATH_PREFIXES,
  type AppMetadata,
} from "@/lib/auth/permissions";

const FACTORY_ID = "f1-uuid";
const RETAILER_ID = "r1-uuid";

const directAdminMeta: AppMetadata = {
  roles: [{ role: "admin", tenant_id: null }],
  active_role: "admin",
  active_tenant_id: null,
};

const atelierOwnerWithAdminMeta: AppMetadata = {
  roles: [
    { role: "atelier_owner", tenant_id: FACTORY_ID },
    { role: "admin", tenant_id: null },
  ],
  active_role: "admin",
  active_tenant_id: null,
};

const atelierOwnerOnlyMeta: AppMetadata = {
  roles: [{ role: "atelier_owner", tenant_id: FACTORY_ID }],
  active_role: "atelier_owner",
  active_tenant_id: FACTORY_ID,
};

const lojistaWithAdminMeta: AppMetadata = {
  roles: [
    { role: "lojista_owner", tenant_id: RETAILER_ID },
    { role: "admin", tenant_id: null },
  ],
  active_role: "admin",
  active_tenant_id: null,
};

describe("isAdmin — extended scenarios", () => {
  it("returns true for direct admin role", () => {
    expect(isAdmin(directAdminMeta)).toBe(true);
  });

  it("returns true for atelier_owner who is also admin", () => {
    expect(isAdmin(atelierOwnerWithAdminMeta)).toBe(true);
  });

  it("returns false for atelier_owner without admin role", () => {
    expect(isAdmin(atelierOwnerOnlyMeta)).toBe(false);
  });

  it("returns true for lojista_owner who is also admin", () => {
    expect(isAdmin(lojistaWithAdminMeta)).toBe(true);
  });

  it("returns false for metadata without roles", () => {
    expect(isAdmin({ active_role: "admin" })).toBe(false);
  });
});

describe("admin path prefixes", () => {
  it("admin can access all shell paths", () => {
    const prefixes = ROLE_PATH_PREFIXES.admin;
    expect(prefixes).toContain("/admin");
    expect(prefixes).toContain("/atelier");
    expect(prefixes).toContain("/lojista");
  });

  it("atelier_owner cannot access admin paths", () => {
    const prefixes = ROLE_PATH_PREFIXES.atelier_owner;
    expect(prefixes).not.toContain("/admin");
    expect(prefixes).toContain("/atelier");
  });

  it("lojista_owner cannot access admin paths", () => {
    const prefixes = ROLE_PATH_PREFIXES.lojista_owner;
    expect(prefixes).not.toContain("/admin");
    expect(prefixes).toContain("/lojista");
  });
});

describe("resolveShell for admin", () => {
  it("resolves admin shell for admin role", () => {
    expect(resolveShell(directAdminMeta)).toBe("admin");
  });

  it("resolves admin shell for multi-role user active as admin", () => {
    expect(resolveShell(atelierOwnerWithAdminMeta)).toBe("admin");
  });

  it("resolves atelier shell when multi-role user active as atelier_owner", () => {
    const meta: AppMetadata = {
      ...atelierOwnerWithAdminMeta,
      active_role: "atelier_owner",
    };
    expect(resolveShell(meta)).toBe("atelier");
  });
});

describe("canAccessTenant for admin", () => {
  it("admin with null tenant_id cannot access specific tenant via canAccessTenant", () => {
    expect(canAccessTenant(directAdminMeta, FACTORY_ID)).toBe(false);
  });

  it("admin with additional atelier_owner role can access factory tenant", () => {
    expect(canAccessTenant(atelierOwnerWithAdminMeta, FACTORY_ID)).toBe(true);
  });
});

describe("hasRole — admin combined with other roles", () => {
  it("detects both admin and atelier_owner", () => {
    expect(hasRole(atelierOwnerWithAdminMeta, "admin")).toBe(true);
    expect(hasRole(atelierOwnerWithAdminMeta, "atelier_owner")).toBe(true);
    expect(hasRole(atelierOwnerWithAdminMeta, "lojista_owner")).toBe(false);
  });
});
