import { describe, it, expect } from "vitest";
import {
  auditLogFiltersSchema,
  auditLogIdSchema,
} from "@/lib/validators/audit-logs";

describe("auditLogFiltersSchema", () => {
  it("accepts empty object with defaults", () => {
    const result = auditLogFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(25);
    }
  });

  it("accepts valid table filter", () => {
    const result = auditLogFiltersSchema.safeParse({ table: "orders" });
    expect(result.success).toBe(true);
  });

  it("accepts valid actor_user_id filter", () => {
    const result = auditLogFiltersSchema.safeParse({
      actor_user_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid actor_user_id", () => {
    const result = auditLogFiltersSchema.safeParse({
      actor_user_id: "not-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("coerces page from string", () => {
    const result = auditLogFiltersSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });

  it("rejects page below 1", () => {
    const result = auditLogFiltersSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects per_page above 100", () => {
    const result = auditLogFiltersSchema.safeParse({ per_page: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects table longer than 100 chars", () => {
    const result = auditLogFiltersSchema.safeParse({
      table: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("auditLogIdSchema", () => {
  it("accepts valid UUID", () => {
    const result = auditLogIdSchema.safeParse(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID", () => {
    const result = auditLogIdSchema.safeParse("not-uuid");
    expect(result.success).toBe(false);
  });
});
