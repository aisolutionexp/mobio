import { describe, it, expect } from "vitest";
import {
  hasRole,
  canAccessTenant,
  isTenantOwner,
  resolveShell,
  type AppMetadata,
} from "@/lib/auth/permissions";

const FACTORY_ID = "f1-uuid";
const RETAILER_ID = "r1-uuid";
const OTHER_RETAILER_ID = "r2-uuid";

const lojistaOwnerMeta: AppMetadata = {
  roles: [{ role: "lojista_owner", tenant_id: RETAILER_ID }],
  active_role: "lojista_owner",
  active_tenant_id: RETAILER_ID,
};

const lojistaBuyerMeta: AppMetadata = {
  roles: [{ role: "lojista_buyer", tenant_id: RETAILER_ID }],
  active_role: "lojista_buyer",
  active_tenant_id: RETAILER_ID,
};

const multiTenantRetailerMeta: AppMetadata = {
  roles: [
    { role: "lojista_owner", tenant_id: RETAILER_ID },
    { role: "lojista_buyer", tenant_id: OTHER_RETAILER_ID },
  ],
  active_role: "lojista_owner",
  active_tenant_id: RETAILER_ID,
};

const factoryOwnerMeta: AppMetadata = {
  roles: [{ role: "atelier_owner", tenant_id: FACTORY_ID }],
  active_role: "atelier_owner",
  active_tenant_id: FACTORY_ID,
};

describe("canAccessTenant for retailer", () => {
  it("lojista_owner can access own retailer", () => {
    expect(canAccessTenant(lojistaOwnerMeta, RETAILER_ID)).toBe(true);
  });

  it("lojista_buyer can access own retailer", () => {
    expect(canAccessTenant(lojistaBuyerMeta, RETAILER_ID)).toBe(true);
  });

  it("lojista_owner cannot access other retailer", () => {
    expect(canAccessTenant(lojistaOwnerMeta, OTHER_RETAILER_ID)).toBe(false);
  });

  it("multi-tenant retailer user can access both tenants", () => {
    expect(canAccessTenant(multiTenantRetailerMeta, RETAILER_ID)).toBe(true);
    expect(canAccessTenant(multiTenantRetailerMeta, OTHER_RETAILER_ID)).toBe(
      true,
    );
  });

  it("factory user cannot access retailer tenant", () => {
    expect(canAccessTenant(factoryOwnerMeta, RETAILER_ID)).toBe(false);
  });
});

describe("isTenantOwner for retailer", () => {
  it("returns true for lojista_owner on own tenant", () => {
    expect(isTenantOwner(lojistaOwnerMeta, RETAILER_ID)).toBe(true);
  });

  it("returns false for lojista_buyer on same tenant", () => {
    expect(isTenantOwner(lojistaBuyerMeta, RETAILER_ID)).toBe(false);
  });

  it("returns false for wrong tenant", () => {
    expect(isTenantOwner(lojistaOwnerMeta, OTHER_RETAILER_ID)).toBe(false);
  });
});

describe("hasRole for lojista roles", () => {
  it("detects lojista_owner", () => {
    expect(hasRole(lojistaOwnerMeta, "lojista_owner")).toBe(true);
  });

  it("detects lojista_buyer", () => {
    expect(hasRole(lojistaBuyerMeta, "lojista_buyer")).toBe(true);
  });

  it("lojista_owner does not have lojista_buyer role", () => {
    expect(hasRole(lojistaOwnerMeta, "lojista_buyer")).toBe(false);
  });
});

describe("resolveShell for lojista", () => {
  it("returns lojista for lojista_owner", () => {
    expect(resolveShell(lojistaOwnerMeta)).toBe("lojista");
  });

  it("returns lojista for lojista_buyer", () => {
    expect(resolveShell(lojistaBuyerMeta)).toBe("lojista");
  });
});
