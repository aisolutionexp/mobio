import { describe, it, expect } from "vitest";
import { changePlanSchema } from "@/lib/validators/subscriptions-retailer";

describe("changePlanSchema", () => {
  it("accepts valid UUID planId", () => {
    const result = changePlanSchema.safeParse({
      planId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID planId", () => {
    const result = changePlanSchema.safeParse({ planId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing planId", () => {
    const result = changePlanSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
