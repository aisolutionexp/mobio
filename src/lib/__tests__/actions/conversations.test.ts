import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/services/active-tenant", () => ({
  getActiveTenantId: vi.fn(),
  getActiveRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getActiveTenantId, getActiveRole } from "@/lib/services/active-tenant";
import {
  sendMessage,
  getOrCreateConversation,
} from "@/lib/actions/conversations";

const mockCreateClient = vi.mocked(createClient);
const mockGetTenantId = vi.mocked(getActiveTenantId);
const mockGetRole = vi.mocked(getActiveRole);

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
    "is",
    "order",
    "limit",
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
  const chain = mockChain({ data: [], error: null });
  return {
    from: vi.fn().mockReturnValue(chain),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTenantId.mockResolvedValue("tenant-1");
  mockGetRole.mockResolvedValue("atelier_owner");
});

describe("sendMessage", () => {
  it("returns error for invalid input", async () => {
    const mockSb = createMockSupabase();
    mockCreateClient.mockResolvedValue(mockSb as never);

    const result = await sendMessage({
      conversation_id: "not-uuid",
      body: "Olá",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error when not authenticated", async () => {
    const mockSb = createMockSupabase({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });
    mockCreateClient.mockResolvedValue(mockSb as never);

    const result = await sendMessage({
      conversation_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "Hello",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("autenticado");
    }
  });

  it("returns success on valid message", async () => {
    const chain = mockChain({
      data: { id: "msg-1" },
      error: null,
    });
    const mockSb = createMockSupabase({ from: vi.fn().mockReturnValue(chain) });
    mockCreateClient.mockResolvedValue(mockSb as never);

    const result = await sendMessage({
      conversation_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "Oi, tudo bem?",
    });

    expect(result.success).toBe(true);
  });
});

describe("getOrCreateConversation", () => {
  it("returns error for invalid factory_id", async () => {
    const mockSb = createMockSupabase();
    mockCreateClient.mockResolvedValue(mockSb as never);

    const result = await getOrCreateConversation({
      factory_id: "not-uuid",
      retailer_id: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(false);
  });
});
