import { describe, it, expect } from "vitest";
import {
  verifyRetailerSchema,
  retailerFiltersSchema,
} from "@/lib/validators/admin";

describe("verifyRetailerSchema", () => {
  it("accepts valid verified decision", () => {
    const result = verifyRetailerSchema.safeParse({
      retailerId: "550e8400-e29b-41d4-a716-446655440000",
      decision: "verified",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid rejected decision with notes", () => {
    const result = verifyRetailerSchema.safeParse({
      retailerId: "550e8400-e29b-41d4-a716-446655440000",
      decision: "rejected",
      notes: "Documentação incompleta",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid retailerId", () => {
    const result = verifyRetailerSchema.safeParse({
      retailerId: "not-uuid",
      decision: "verified",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid decision value", () => {
    const result = verifyRetailerSchema.safeParse({
      retailerId: "550e8400-e29b-41d4-a716-446655440000",
      decision: "approved",
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes longer than 500 chars", () => {
    const result = verifyRetailerSchema.safeParse({
      retailerId: "550e8400-e29b-41d4-a716-446655440000",
      decision: "rejected",
      notes: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts without notes", () => {
    const result = verifyRetailerSchema.safeParse({
      retailerId: "550e8400-e29b-41d4-a716-446655440000",
      decision: "verified",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });
});

describe("retailerFiltersSchema", () => {
  it("accepts empty object with defaults", () => {
    const result = retailerFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  it("accepts valid verification_status", () => {
    const result = retailerFiltersSchema.safeParse({
      verification_status: "pending",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid verification_status", () => {
    const result = retailerFiltersSchema.safeParse({
      verification_status: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["unverified", "pending", "verified", "rejected"]) {
      const result = retailerFiltersSchema.safeParse({
        verification_status: status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("coerces page from string", () => {
    const result = retailerFiltersSchema.safeParse({ page: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
    }
  });

  it("rejects query longer than 200 chars", () => {
    const result = retailerFiltersSchema.safeParse({
      query: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
