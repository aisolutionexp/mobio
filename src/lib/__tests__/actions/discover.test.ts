import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/services/active-tenant", () => ({
  requireRetailerAccess: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  searchFactories,
  listRegionsWithCount,
  listCategoriesWithCount,
} from "@/lib/actions/discover";

const mockCreateClient = vi.mocked(createClient);
const mockRequireRetailer = vi.mocked(requireRetailerAccess);

function createMockSupabase(overrides: Record<string, unknown> = {}) {
  const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  });

  return { rpc: mockRpc, from: mockFrom, ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireRetailer.mockResolvedValue({
    tenantId: "tenant-1",
    role: "lojista_owner",
  });
});

describe("searchFactories", () => {
  it("calls requireRetailerAccess", async () => {
    const mock = createMockSupabase();
    mockCreateClient.mockResolvedValue(mock as never);

    await searchFactories({ page: 0 });
    expect(mockRequireRetailer).toHaveBeenCalled();
  });

  it("calls RPC search_factories with correct params", async () => {
    const mock = createMockSupabase();
    mockCreateClient.mockResolvedValue(mock as never);

    await searchFactories({
      query: "couro",
      regionId: "550e8400-e29b-41d4-a716-446655440000",
      categoryId: "660e8400-e29b-41d4-a716-446655440000",
      page: 0,
    });

    expect(mock.rpc).toHaveBeenCalledWith("search_factories", {
      query_text: "couro",
      region_id_filter: "550e8400-e29b-41d4-a716-446655440000",
      category_id_filter: "660e8400-e29b-41d4-a716-446655440000",
      limit_count: 21,
    });
  });

  it("throws on invalid input", async () => {
    const mock = createMockSupabase();
    mockCreateClient.mockResolvedValue(mock as never);

    await expect(
      searchFactories({ regionId: "not-uuid", page: 0 }),
    ).rejects.toThrow();
  });

  it("returns hasMore=false when results fit in page", async () => {
    const factories = Array.from({ length: 5 }, (_, i) => ({
      id: `f${i}`,
      name: `Factory ${i}`,
      slug: `factory-${i}`,
      region_id: null,
    }));

    const mock = createMockSupabase();
    mock.rpc.mockResolvedValue({ data: factories, error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await searchFactories({ page: 0 });
    expect(result.hasMore).toBe(false);
    expect(result.factories).toHaveLength(5);
  });
});

describe("listRegionsWithCount", () => {
  it("calls requireRetailerAccess", async () => {
    const mock = createMockSupabase();
    mock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    mockCreateClient.mockResolvedValue(mock as never);

    await listRegionsWithCount();
    expect(mockRequireRetailer).toHaveBeenCalled();
  });

  it("filters out regions with zero factories", async () => {
    const regions = [
      { id: "r1", name: "Sul", code: "SUL", factories: [{ count: 3 }] },
      { id: "r2", name: "Norte", code: "NOR", factories: [{ count: 0 }] },
    ];

    const mock = createMockSupabase();
    mock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: regions, error: null }),
      }),
    });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await listRegionsWithCount();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Sul");
  });
});

describe("listCategoriesWithCount", () => {
  it("calls requireRetailerAccess", async () => {
    const mock = createMockSupabase();
    mock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    mockCreateClient.mockResolvedValue(mock as never);

    await listCategoriesWithCount();
    expect(mockRequireRetailer).toHaveBeenCalled();
  });
});
