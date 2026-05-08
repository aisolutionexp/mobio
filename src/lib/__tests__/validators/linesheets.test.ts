import { describe, it, expect } from "vitest";
import {
  createLinesheetSchema,
  updateLinesheetSchema,
  addProductToLinesheetSchema,
  reorderLinesheetItemsSchema,
  updateLinesheetItemNoteSchema,
  updateLinesheetItemCustomPriceSchema,
  importBoardToLinesheetSchema,
  pricingVariantSchema,
} from "@/lib/validators/linesheets";

describe("pricingVariantSchema", () => {
  it("accepts 'retailer'", () => {
    expect(pricingVariantSchema.safeParse("retailer").success).toBe(true);
  });

  it("accepts 'msrp'", () => {
    expect(pricingVariantSchema.safeParse("msrp").success).toBe(true);
  });

  it("accepts 'custom'", () => {
    expect(pricingVariantSchema.safeParse("custom").success).toBe(true);
  });

  it("rejects invalid variant", () => {
    expect(pricingVariantSchema.safeParse("wholesale").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(pricingVariantSchema.safeParse("").success).toBe(false);
  });
});

describe("createLinesheetSchema", () => {
  it("accepts valid input with default pricing_variant", () => {
    const result = createLinesheetSchema.safeParse({ name: "Verão 2026" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.pricing_variant).toBe("retailer");
  });

  it("accepts custom pricing_variant", () => {
    const result = createLinesheetSchema.safeParse({
      name: "Verão 2026",
      pricing_variant: "msrp",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.pricing_variant).toBe("msrp");
  });

  it("rejects empty name", () => {
    const result = createLinesheetSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 100 chars", () => {
    const result = createLinesheetSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts empty description", () => {
    const result = createLinesheetSchema.safeParse({
      name: "Test",
      description: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects description longer than 500 chars", () => {
    const result = createLinesheetSchema.safeParse({
      name: "Test",
      description: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pricing_variant", () => {
    const result = createLinesheetSchema.safeParse({
      name: "Test",
      pricing_variant: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLinesheetSchema", () => {
  it("accepts partial update (name only)", () => {
    const result = updateLinesheetSchema.safeParse({ name: "Novo nome" });
    expect(result.success).toBe(true);
  });

  it("accepts pricing_variant update", () => {
    const result = updateLinesheetSchema.safeParse({
      pricing_variant: "custom",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateLinesheetSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("addProductToLinesheetSchema", () => {
  it("accepts valid UUIDs without customPrice", () => {
    const result = addProductToLinesheetSchema.safeParse({
      linesheetId: "550e8400-e29b-41d4-a716-446655440000",
      productId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("accepts customPrice as number", () => {
    const result = addProductToLinesheetSchema.safeParse({
      linesheetId: "550e8400-e29b-41d4-a716-446655440000",
      productId: "660e8400-e29b-41d4-a716-446655440000",
      customPrice: 199.9,
    });
    expect(result.success).toBe(true);
  });

  it("coerces customPrice from string", () => {
    const result = addProductToLinesheetSchema.safeParse({
      linesheetId: "550e8400-e29b-41d4-a716-446655440000",
      productId: "660e8400-e29b-41d4-a716-446655440000",
      customPrice: "299.99",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.customPrice).toBe(299.99);
  });

  it("rejects negative customPrice", () => {
    const result = addProductToLinesheetSchema.safeParse({
      linesheetId: "550e8400-e29b-41d4-a716-446655440000",
      productId: "660e8400-e29b-41d4-a716-446655440000",
      customPrice: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero customPrice", () => {
    const result = addProductToLinesheetSchema.safeParse({
      linesheetId: "550e8400-e29b-41d4-a716-446655440000",
      productId: "660e8400-e29b-41d4-a716-446655440000",
      customPrice: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("reorderLinesheetItemsSchema", () => {
  it("accepts valid reorder input", () => {
    const result = reorderLinesheetItemsSchema.safeParse({
      linesheetId: "550e8400-e29b-41d4-a716-446655440000",
      ordering: [
        { id: "660e8400-e29b-41d4-a716-446655440000", position: 0 },
        { id: "770e8400-e29b-41d4-a716-446655440000", position: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative position", () => {
    const result = reorderLinesheetItemsSchema.safeParse({
      linesheetId: "550e8400-e29b-41d4-a716-446655440000",
      ordering: [{ id: "660e8400-e29b-41d4-a716-446655440000", position: -1 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLinesheetItemNoteSchema", () => {
  it("accepts valid note", () => {
    const result = updateLinesheetItemNoteSchema.safeParse({
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      note: "Destaque",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null note", () => {
    const result = updateLinesheetItemNoteSchema.safeParse({
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      note: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects note longer than 1000 chars", () => {
    const result = updateLinesheetItemNoteSchema.safeParse({
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      note: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLinesheetItemCustomPriceSchema", () => {
  it("accepts valid price", () => {
    const result = updateLinesheetItemCustomPriceSchema.safeParse({
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      customPrice: 250,
    });
    expect(result.success).toBe(true);
  });

  it("coerces string to number", () => {
    const result = updateLinesheetItemCustomPriceSchema.safeParse({
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      customPrice: "199.90",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.customPrice).toBe(199.9);
  });

  it("rejects negative price", () => {
    const result = updateLinesheetItemCustomPriceSchema.safeParse({
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      customPrice: -50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = updateLinesheetItemCustomPriceSchema.safeParse({
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      customPrice: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("importBoardToLinesheetSchema", () => {
  it("accepts valid UUIDs", () => {
    const result = importBoardToLinesheetSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      linesheetId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid boardId", () => {
    const result = importBoardToLinesheetSchema.safeParse({
      boardId: "not-uuid",
      linesheetId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid linesheetId", () => {
    const result = importBoardToLinesheetSchema.safeParse({
      boardId: "550e8400-e29b-41d4-a716-446655440000",
      linesheetId: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
