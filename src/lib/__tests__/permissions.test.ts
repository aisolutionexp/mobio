import { describe, it, expect } from "vitest";
import {
  hasRole,
  canAccessTenant,
  isAdmin,
  isTenantOwner,
  resolveShell,
  type AppMetadata,
} from "@/lib/auth/permissions";

const FACTORY_ID = "f1-uuid";
const RETAILER_ID = "r1-uuid";

const ownerMeta: AppMetadata = {
  roles: [{ role: "atelier_owner", tenant_id: FACTORY_ID }],
  active_role: "atelier_owner",
  active_tenant_id: FACTORY_ID,
};

const memberMeta: AppMetadata = {
  roles: [{ role: "atelier_member", tenant_id: FACTORY_ID }],
  active_role: "atelier_member",
  active_tenant_id: FACTORY_ID,
};

const lojistaMeta: AppMetadata = {
  roles: [{ role: "lojista_owner", tenant_id: RETAILER_ID }],
  active_role: "lojista_owner",
  active_tenant_id: RETAILER_ID,
};

const adminMeta: AppMetadata = {
  roles: [{ role: "admin", tenant_id: null }],
  active_role: "admin",
  active_tenant_id: null,
};

const multiTenantMeta: AppMetadata = {
  roles: [
    { role: "atelier_owner", tenant_id: FACTORY_ID },
    { role: "lojista_buyer", tenant_id: RETAILER_ID },
  ],
  active_role: "atelier_owner",
  active_tenant_id: FACTORY_ID,
};

describe("hasRole", () => {
  it("returns true when user has the role", () => {
    expect(hasRole(ownerMeta, "atelier_owner")).toBe(true);
  });

  it("returns false when user does not have the role", () => {
    expect(hasRole(ownerMeta, "admin")).toBe(false);
  });

  it("returns false for undefined metadata", () => {
    expect(hasRole(undefined, "admin")).toBe(false);
  });

  it("returns false for empty roles array", () => {
    expect(hasRole({ roles: [] }, "admin")).toBe(false);
  });
});

describe("canAccessTenant", () => {
  it("returns true for matching tenant", () => {
    expect(canAccessTenant(ownerMeta, FACTORY_ID)).toBe(true);
  });

  it("returns false for non-matching tenant", () => {
    expect(canAccessTenant(ownerMeta, "unknown-id")).toBe(false);
  });

  it("works with multi-tenant user", () => {
    expect(canAccessTenant(multiTenantMeta, FACTORY_ID)).toBe(true);
    expect(canAccessTenant(multiTenantMeta, RETAILER_ID)).toBe(true);
    expect(canAccessTenant(multiTenantMeta, "unknown-id")).toBe(false);
  });

  it("returns false for undefined metadata", () => {
    expect(canAccessTenant(undefined, FACTORY_ID)).toBe(false);
  });
});

describe("isAdmin", () => {
  it("returns true for admin", () => {
    expect(isAdmin(adminMeta)).toBe(true);
  });

  it("returns false for non-admin", () => {
    expect(isAdmin(ownerMeta)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("isTenantOwner", () => {
  it("returns true for atelier_owner of the tenant", () => {
    expect(isTenantOwner(ownerMeta, FACTORY_ID)).toBe(true);
  });

  it("returns false for atelier_member", () => {
    expect(isTenantOwner(memberMeta, FACTORY_ID)).toBe(false);
  });

  it("returns true for lojista_owner", () => {
    expect(isTenantOwner(lojistaMeta, RETAILER_ID)).toBe(true);
  });

  it("returns false for wrong tenant", () => {
    expect(isTenantOwner(ownerMeta, "unknown-id")).toBe(false);
  });
});

describe("resolveShell", () => {
  it("returns 'atelier' for atelier_owner", () => {
    expect(resolveShell(ownerMeta)).toBe("atelier");
  });

  it("returns 'atelier' for atelier_member", () => {
    expect(resolveShell(memberMeta)).toBe("atelier");
  });

  it("returns 'lojista' for lojista_owner", () => {
    expect(resolveShell(lojistaMeta)).toBe("lojista");
  });

  it("returns 'admin' for admin", () => {
    expect(resolveShell(adminMeta)).toBe("admin");
  });

  it("returns null when no active role", () => {
    expect(resolveShell(undefined)).toBeNull();
    expect(resolveShell({})).toBeNull();
  });
});
