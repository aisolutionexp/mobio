import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/services/active-tenant", () => ({
  requireRetailerAccess: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import { cancelOrder } from "@/lib/actions/orders-retailer";

const mockCreateClient = vi.mocked(createClient);
const mockRequireRetailer = vi.mocked(requireRetailerAccess);
const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const TENANT_ID = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33";

function mockChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  const terminalMethods = ["single", "maybeSingle"];
  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "in",
    "order",
    "limit",
    "range",
  ];

  for (const method of terminalMethods) {
    chain[method] = vi.fn().mockResolvedValue(resolvedValue);
  }
  for (const method of chainMethods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  return chain;
}

function createMockSupabase(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
      }),
    },
    from: vi
      .fn()
      .mockReturnValue(mockChain({ data: { id: VALID_UUID }, error: null })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
    },
    ...overrides,
  } as unknown as ReturnType<typeof createClient> extends Promise<infer U>
    ? U
    : never;
}

describe("cancelOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRetailer.mockResolvedValue({
      tenantId: TENANT_ID,
      role: "lojista_owner",
    });
  });

  it("returns error for invalid orderId", async () => {
    const supabase = createMockSupabase();
    mockCreateClient.mockResolvedValue(supabase);

    const result = await cancelOrder("bad-id");
    expect(result.success).toBe(false);
  });

  it("returns success when edge function returns ok", async () => {
    const supabase = createMockSupabase();
    mockCreateClient.mockResolvedValue(supabase);

    const result = await cancelOrder(VALID_UUID);
    expect(result.success).toBe(true);
  });

  it("returns error when order not found", async () => {
    const chain = mockChain({ data: null, error: { message: "Not found" } });
    const supabase = createMockSupabase({
      from: vi.fn().mockReturnValue(chain),
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await cancelOrder(VALID_UUID);
    expect(result.success).toBe(false);
  });
});
