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
  createLinesheet,
  deleteLinesheet,
  addProductToLinesheet,
  updateLinesheetItemNote,
} from "@/lib/actions/linesheets";

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
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrls: vi.fn().mockResolvedValue({ data: [] }),
      }),
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

describe("createLinesheet", () => {
  it("returns success with linesheet id", async () => {
    const insertChain = mockChain({ data: { id: "ls-1" }, error: null });
    const mock = {
      from: vi.fn().mockReturnValue(insertChain),
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
    };

    mockCreateClient
      .mockResolvedValueOnce(mock as never)
      .mockResolvedValueOnce(mock as never);

    const formData = new FormData();
    formData.set("name", "Verão 2026");
    formData.set("description", "");
    formData.set("pricing_variant", "retailer");

    const result = await createLinesheet(null, formData);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe("ls-1");
  });

  it("returns error for empty name", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);

    const formData = new FormData();
    formData.set("name", "");

    const result = await createLinesheet(null, formData);
    expect(result.success).toBe(false);
  });

  it("returns error for invalid pricing_variant", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);

    const formData = new FormData();
    formData.set("name", "Test");
    formData.set("pricing_variant", "invalid");

    const result = await createLinesheet(null, formData);
    expect(result.success).toBe(false);
  });
});

describe("deleteLinesheet", () => {
  it("returns error for invalid UUID", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);
    const result = await deleteLinesheet("not-uuid");
    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toBe("ID inválido");
  });
});

describe("addProductToLinesheet", () => {
  it("returns error for invalid product UUID", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);
    const result = await addProductToLinesheet(
      "550e8400-e29b-41d4-a716-446655440000",
      "invalid",
    );
    expect(result.success).toBe(false);
  });
});

describe("updateLinesheetItemNote", () => {
  it("returns error for invalid item UUID", async () => {
    mockCreateClient.mockResolvedValue(createMockSupabase() as never);
    const result = await updateLinesheetItemNote("not-uuid", "note");
    expect(result.success).toBe(false);
  });
});
