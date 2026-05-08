import { describe, it, expect } from "vitest";
import {
  createBoardSchema,
  updateBoardSchema,
  addProductToBoardSchema,
  reorderBoardItemsSchema,
  updateBoardItemNoteSchema,
} from "@/lib/validators/boards";

describe("createBoardSchema", () => {
  it("accepts valid input", () => {
    const result = createBoardSchema.safeParse({
      name: "Favoritos Verão",
      description: "Meus favoritos",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty description", () => {
    const result = createBoardSchema.safeParse({
      name: "Board teste",
      description: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createBoardSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 100 chars", () => {
    const result = createBoardSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 500 chars", () => {
    const result = createBoardSchema.safeParse({
      name: "Valid",
      description: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts is_public boolean", () => {
    const result = createBoardSchema.safeParse({
      name: "Board público",
      is_public: true,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.is_public).toBe(true);
  });

  it("coerces is_public string to boolean", () => {
    const result = createBoardSchema.safeParse({
      name: "Board",
      is_public: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.is_public).toBe(true);
  });

  it("accepts missing is_public", () => {
    const result = createBoardSchema.safeParse({ name: "Board" });
    expect(result.success).toBe(true);
  });
});

describe("updateBoardSchema", () => {
  it("accepts partial update (name only)", () => {
    const result = updateBoardSchema.safeParse({ name: "Novo nome" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateBoardSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty name string", () => {
    const result = updateBoardSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("addProductToBoardSchema", () => {
  it("accepts valid UUIDs", () => {
    const result = addProductToBoardSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      productId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid boardId", () => {
    const result = addProductToBoardSchema.safeParse({
      boardId: "not-uuid",
      productId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid productId", () => {
    const result = addProductToBoardSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      productId: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("reorderBoardItemsSchema", () => {
  it("accepts valid reorder input", () => {
    const result = reorderBoardItemsSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      ordering: [
        { id: "660e8400-e29b-41d4-a716-446655440000", position: 0 },
        { id: "770e8400-e29b-41d4-a716-446655440000", position: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative position", () => {
    const result = reorderBoardItemsSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      ordering: [{ id: "660e8400-e29b-41d4-a716-446655440000", position: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty ordering array", () => {
    const result = reorderBoardItemsSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      ordering: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("updateBoardItemNoteSchema", () => {
  it("accepts valid note", () => {
    const result = updateBoardItemNoteSchema.safeParse({
      boardItemId: "550e8400-e29b-41d4-a716-446655440000",
      note: "Destaque da coleção",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null note", () => {
    const result = updateBoardItemNoteSchema.safeParse({
      boardItemId: "550e8400-e29b-41d4-a716-446655440000",
      note: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects note longer than 500 chars", () => {
    const result = updateBoardItemNoteSchema.safeParse({
      boardItemId: "550e8400-e29b-41d4-a716-446655440000",
      note: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID", () => {
    const result = updateBoardItemNoteSchema.safeParse({
      boardItemId: "not-uuid",
      note: "ok",
    });
    expect(result.success).toBe(false);
  });
});
