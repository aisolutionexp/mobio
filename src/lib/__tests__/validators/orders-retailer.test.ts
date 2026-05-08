import { describe, it, expect } from "vitest";
import {
  orderIdSchema,
  listRetailerOrdersSchema,
} from "@/lib/validators/orders-retailer";

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

describe("orderIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(orderIdSchema.safeParse(VALID_UUID).success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(orderIdSchema.safeParse("invalid").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(orderIdSchema.safeParse("").success).toBe(false);
  });
});

describe("listRetailerOrdersSchema", () => {
  it("accepts empty object", () => {
    expect(listRetailerOrdersSchema.safeParse({}).success).toBe(true);
  });

  it("accepts status filter", () => {
    expect(
      listRetailerOrdersSchema.safeParse({ status: "pending" }).success,
    ).toBe(true);
  });

  it("accepts factory_id filter", () => {
    expect(
      listRetailerOrdersSchema.safeParse({ factory_id: VALID_UUID }).success,
    ).toBe(true);
  });

  it("rejects invalid factory_id", () => {
    expect(
      listRetailerOrdersSchema.safeParse({ factory_id: "bad" }).success,
    ).toBe(false);
  });
});
