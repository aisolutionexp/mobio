import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import {
  getActiveTenantId,
  getActiveRole,
  requireFactoryAccess,
} from "@/lib/services/active-tenant";

const mockCreateClient = vi.mocked(createClient);

function mockSupabaseUser(user: Record<string, unknown> | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
      }),
    },
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getActiveTenantId", () => {
  it("returns tenant id when available", async () => {
    mockSupabaseUser({
      id: "user-1",
      app_metadata: {
        active_tenant_id: "tenant-1",
        active_role: "atelier_owner",
      },
    });

    const tenantId = await getActiveTenantId();
    expect(tenantId).toBe("tenant-1");
  });

  it("throws when user is null", async () => {
    mockSupabaseUser(null);
    await expect(getActiveTenantId()).rejects.toThrow("Não autenticado");
  });

  it("throws when no active tenant", async () => {
    mockSupabaseUser({ id: "user-1", app_metadata: {} });
    await expect(getActiveTenantId()).rejects.toThrow("Nenhum tenant ativo");
  });
});

describe("getActiveRole", () => {
  it("returns role when available", async () => {
    mockSupabaseUser({
      id: "user-1",
      app_metadata: { active_role: "atelier_owner", active_tenant_id: "t1" },
    });

    const role = await getActiveRole();
    expect(role).toBe("atelier_owner");
  });

  it("throws when no active role", async () => {
    mockSupabaseUser({ id: "user-1", app_metadata: {} });
    await expect(getActiveRole()).rejects.toThrow("Nenhum role ativo");
  });
});

describe("requireFactoryAccess", () => {
  it("returns tenantId and role for atelier_owner", async () => {
    mockSupabaseUser({
      id: "user-1",
      app_metadata: { active_role: "atelier_owner", active_tenant_id: "t1" },
    });

    const result = await requireFactoryAccess();
    expect(result).toEqual({ tenantId: "t1", role: "atelier_owner" });
  });

  it("returns tenantId and role for atelier_member", async () => {
    mockSupabaseUser({
      id: "user-1",
      app_metadata: { active_role: "atelier_member", active_tenant_id: "t1" },
    });

    const result = await requireFactoryAccess();
    expect(result).toEqual({ tenantId: "t1", role: "atelier_member" });
  });

  it("returns tenantId and role for admin", async () => {
    mockSupabaseUser({
      id: "user-1",
      app_metadata: { active_role: "admin", active_tenant_id: "t1" },
    });

    const result = await requireFactoryAccess();
    expect(result).toEqual({ tenantId: "t1", role: "admin" });
  });

  it("throws for lojista role", async () => {
    mockSupabaseUser({
      id: "user-1",
      app_metadata: { active_role: "lojista_owner", active_tenant_id: "t1" },
    });

    await expect(requireFactoryAccess()).rejects.toThrow(
      "Acesso restrito a membros do atelier",
    );
  });

  it("throws when not authenticated", async () => {
    mockSupabaseUser(null);
    await expect(requireFactoryAccess()).rejects.toThrow("Não autenticado");
  });

  it("throws when session is invalid (no role)", async () => {
    mockSupabaseUser({
      id: "user-1",
      app_metadata: { active_tenant_id: "t1" },
    });

    await expect(requireFactoryAccess()).rejects.toThrow("Sessão inválida");
  });
});
