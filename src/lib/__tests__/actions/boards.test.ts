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
import {
  listRetailerBoards,
  createBoard,
  deleteBoard,
  addProductToBoard,
} from "@/lib/actions/boards";

const mockCreateClient = vi.mocked(createClient);
const mockRequireRetailer = vi.mocked(requireRetailerAccess);

function mockChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  const terminalMethods = ["single", "maybeSingle"];
  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "in",
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
  mockRequireRetailer.mockResolvedValue({
    tenantId: "tenant-1",
    role: "lojista_owner",
  });
});

describe("listRetailerBoards", () => {
  it("calls requireRetailerAccess", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);
    await listRetailerBoards();
    expect(mockRequireRetailer).toHaveBeenCalled();
  });

  it("returns empty array on error", async () => {
    const chain = mockChain({ data: null, error: { message: "fail" } });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);
    const result = await listRetailerBoards();
    expect(result).toEqual([]);
  });
});

describe("createBoard", () => {
  it("returns success with board id", async () => {
    const chain = mockChain({ data: { id: "board-1" }, error: null });
    const mock = {
      from: vi.fn().mockReturnValue(chain),
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
    };
    mockCreateClient.mockResolvedValue(mock as never);

    const formData = new FormData();
    formData.set("name", "Meu Board");
    formData.set("description", "");

    const result = await createBoard(null, formData);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe("board-1");
  });

  it("returns error for empty name", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);

    const formData = new FormData();
    formData.set("name", "");

    const result = await createBoard(null, formData);
    expect(result.success).toBe(false);
  });
});

describe("deleteBoard", () => {
  it("returns error for invalid UUID", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);
    const result = await deleteBoard("not-uuid");
    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toBe("ID inválido");
  });
});

describe("addProductToBoard", () => {
  it("returns error for invalid product UUID", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);
    const result = await addProductToBoard(
      "550e8400-e29b-41d4-a716-446655440000",
      "invalid",
    );
    expect(result.success).toBe(false);
  });
});
