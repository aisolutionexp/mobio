import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/services/active-tenant", () => ({
  requireFactoryAccess: vi.fn(),
  requireRetailerAccess: vi.fn(),
}));

vi.mock("@/lib/services/admin", () => ({
  requireAdmin: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { requireAdmin } from "@/lib/services/admin";
import {
  getFactoryAnalytics,
  getRetailerAnalytics,
  getAdminOverview,
} from "@/lib/actions/analytics";

const mockCreateClient = vi.mocked(createClient);
const mockRequireFactory = vi.mocked(requireFactoryAccess);
const mockRequireAdmin = vi.mocked(requireAdmin);

function mockRpc(resolvedValue: unknown) {
  const rpc = vi.fn().mockResolvedValue(resolvedValue);
  return { rpc };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getFactoryAnalytics", () => {
  it("returns analytics data for valid period", async () => {
    mockRequireFactory.mockResolvedValue({
      tenantId: "factory-1",
      role: "atelier_owner",
    });

    const rpcData = [
      {
        gmv_cents: 100000,
        orders_count: 10,
        avg_ticket_cents: 10000,
        active_retailers: 3,
        top_products: [],
        top_retailers: [],
      },
    ];

    const supabase = mockRpc({ data: rpcData, error: null });
    mockCreateClient.mockResolvedValue(supabase as never);

    const result = await getFactoryAnalytics("30d");
    expect(result.gmv_cents).toBe(100000);
    expect(result.orders_count).toBe(10);
  });

  it("returns zeroed data when RPC returns empty", async () => {
    mockRequireFactory.mockResolvedValue({
      tenantId: "factory-1",
      role: "atelier_owner",
    });

    const supabase = mockRpc({ data: [], error: null });
    mockCreateClient.mockResolvedValue(supabase as never);

    const result = await getFactoryAnalytics("7d");
    expect(result.gmv_cents).toBe(0);
    expect(result.orders_count).toBe(0);
  });

  it("throws when RPC fails", async () => {
    mockRequireFactory.mockResolvedValue({
      tenantId: "factory-1",
      role: "atelier_owner",
    });

    const supabase = mockRpc({
      data: null,
      error: { message: "RPC failed" },
    });
    mockCreateClient.mockResolvedValue(supabase as never);

    await expect(getFactoryAnalytics("30d")).rejects.toThrow("RPC failed");
  });
});

describe("getAdminOverview", () => {
  it("returns overview data", async () => {
    mockRequireAdmin.mockResolvedValue({ userId: "admin-1", role: "admin" });

    const rpcData = [
      {
        total_factories: 5,
        total_retailers: 10,
        total_orders: 50,
        total_gmv_cents: 500000,
        signups_last_30d: 3,
      },
    ];

    const supabase = mockRpc({ data: rpcData, error: null });
    mockCreateClient.mockResolvedValue(supabase as never);

    const result = await getAdminOverview();
    expect(result.total_factories).toBe(5);
    expect(result.total_gmv_cents).toBe(500000);
  });
});
