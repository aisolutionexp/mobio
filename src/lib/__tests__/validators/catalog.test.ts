import { describe, it, expect } from "vitest";
import {
  createCollectionSchema,
  updateCollectionSchema,
  createProductSchema,
  updateProductSchema,
  addFinishSchema,
  addSpecSchema,
} from "@/lib/validators/catalog";

describe("createCollectionSchema", () => {
  it("accepts valid input", () => {
    const result = createCollectionSchema.safeParse({
      name: "Primavera 2027",
      description: "Nova coleção",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty description", () => {
    const result = createCollectionSchema.safeParse({
      name: "Primavera 2027",
      description: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 chars", () => {
    const result = createCollectionSchema.safeParse({ name: "AB" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("ao menos 3");
  });

  it("rejects name longer than 100 chars", () => {
    const result = createCollectionSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 500 chars", () => {
    const result = createCollectionSchema.safeParse({
      name: "Valid Name",
      description: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCollectionSchema", () => {
  it("accepts partial update (name only)", () => {
    const result = updateCollectionSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateCollectionSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("createProductSchema", () => {
  it("accepts valid full input", () => {
    const result = createProductSchema.safeParse({
      collection_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Sandalia Resort",
      sku: "SR-001",
      description: "Uma sandalia premium",
      wholesale_price: 120.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid collection_id", () => {
    const result = createProductSchema.safeParse({
      collection_id: "not-a-uuid",
      name: "Sandalia",
      sku: "SR-001",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("inválida");
  });

  it("rejects short SKU", () => {
    const result = createProductSchema.safeParse({
      collection_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Sandalia Resort",
      sku: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("coerces wholesale_price from string", () => {
    const result = createProductSchema.safeParse({
      collection_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Sandalia Resort",
      sku: "SR-001",
      wholesale_price: "99.90",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wholesale_price).toBe(99.9);
    }
  });

  it("rejects negative price", () => {
    const result = createProductSchema.safeParse({
      collection_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Sandalia Resort",
      sku: "SR-001",
      wholesale_price: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProductSchema", () => {
  it("accepts partial update", () => {
    const result = updateProductSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateProductSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("addFinishSchema", () => {
  it("accepts valid finish", () => {
    const result = addFinishSchema.safeParse({ name: "Couro" });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = addFinishSchema.safeParse({ name: "C" });
    expect(result.success).toBe(false);
  });

  it("accepts finish with description", () => {
    const result = addFinishSchema.safeParse({
      name: "Camurça",
      description: "Material sintético premium",
    });
    expect(result.success).toBe(true);
  });
});

describe("addSpecSchema", () => {
  it("accepts valid spec", () => {
    const result = addSpecSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      spec_key: "Material",
      spec_value: "Couro bovino",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty spec_key", () => {
    const result = addSpecSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      spec_key: "",
      spec_value: "Valor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty spec_value", () => {
    const result = addSpecSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      spec_key: "Material",
      spec_value: "",
    });
    expect(result.success).toBe(false);
  });
});
