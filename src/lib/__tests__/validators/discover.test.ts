import { describe, it, expect } from "vitest";
import { searchFactoriesSchema } from "@/lib/validators/discover";

describe("searchFactoriesSchema", () => {
  it("accepts empty object with defaults", () => {
    const result = searchFactoriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(0);
      expect(result.data.query).toBeUndefined();
    }
  });

  it("accepts valid query string", () => {
    const result = searchFactoriesSchema.safeParse({ query: "sandalia" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("sandalia");
    }
  });

  it("trims whitespace from query", () => {
    const result = searchFactoriesSchema.safeParse({ query: "  couro  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("couro");
    }
  });

  it("accepts valid UUID for regionId", () => {
    const result = searchFactoriesSchema.safeParse({
      regionId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for regionId", () => {
    const result = searchFactoriesSchema.safeParse({
      regionId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid UUID for categoryId", () => {
    const result = searchFactoriesSchema.safeParse({
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for categoryId", () => {
    const result = searchFactoriesSchema.safeParse({
      categoryId: "xyz",
    });
    expect(result.success).toBe(false);
  });

  it("coerces page from string to number", () => {
    const result = searchFactoriesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("rejects negative page", () => {
    const result = searchFactoriesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts all fields together", () => {
    const result = searchFactoriesSchema.safeParse({
      query: "sandalia",
      regionId: "550e8400-e29b-41d4-a716-446655440000",
      categoryId: "660e8400-e29b-41d4-a716-446655440000",
      page: 2,
    });
    expect(result.success).toBe(true);
  });
});
