import { describe, it, expect } from "vitest";
import {
  statementIdSchema,
  generateStatementsSchema,
} from "@/lib/validators/statements";

describe("statementIdSchema", () => {
  it("accepts valid UUID", () => {
    const result = statementIdSchema.safeParse(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID string", () => {
    const result = statementIdSchema.safeParse("not-uuid");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = statementIdSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("generateStatementsSchema", () => {
  it("accepts valid date", () => {
    const result = generateStatementsSchema.safeParse({
      periodStart: "2025-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = generateStatementsSchema.safeParse({
      periodStart: "01-2025",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing periodStart", () => {
    const result = generateStatementsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string periodStart", () => {
    const result = generateStatementsSchema.safeParse({
      periodStart: 20250101,
    });
    expect(result.success).toBe(false);
  });
});
