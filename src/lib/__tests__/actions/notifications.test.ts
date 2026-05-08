import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/actions/notifications";

const mockCreateClient = vi.mocked(createClient);
const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const USER_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22";

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
        data: { user: { id: USER_ID } },
      }),
    },
    from: vi.fn().mockReturnValue(mockChain({ data: null, error: null })),
    ...overrides,
  } as unknown as ReturnType<typeof createClient> extends Promise<infer U>
    ? U
    : never;
}

describe("markAsRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error for invalid UUID", async () => {
    const supabase = createMockSupabase();
    mockCreateClient.mockResolvedValue(supabase);

    const result = await markAsRead("bad-id");
    expect(result.success).toBe(false);
  });

  it("returns error when not authenticated", async () => {
    const supabase = createMockSupabase({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await markAsRead(VALID_UUID);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Não autenticado");
  });

  it("returns success when update succeeds", async () => {
    const chain = mockChain({ data: null, error: null });
    const supabase = createMockSupabase({
      from: vi.fn().mockReturnValue(chain),
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await markAsRead(VALID_UUID);
    expect(result.success).toBe(true);
  });
});

describe("markAllAsRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns success", async () => {
    const chain = mockChain({ data: null, error: null });
    const supabase = createMockSupabase({
      from: vi.fn().mockReturnValue(chain),
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await markAllAsRead();
    expect(result.success).toBe(true);
  });
});

describe("deleteNotification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error for invalid UUID", async () => {
    const supabase = createMockSupabase();
    mockCreateClient.mockResolvedValue(supabase);

    const result = await deleteNotification("not-a-uuid");
    expect(result.success).toBe(false);
  });

  it("returns success when delete succeeds", async () => {
    const chain = mockChain({ data: null, error: null });
    const supabase = createMockSupabase({
      from: vi.fn().mockReturnValue(chain),
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await deleteNotification(VALID_UUID);
    expect(result.success).toBe(true);
  });
});
