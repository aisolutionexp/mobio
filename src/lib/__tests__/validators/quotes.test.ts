import { describe, it, expect } from "vitest";
import { createQuoteSchema } from "@/lib/validators/quotes";

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

function futureDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

describe("createQuoteSchema", () => {
  const validInput = {
    retailer_id: VALID_UUID,
    valid_until: futureDate(30),
    items: [{ product_id: VALID_UUID, quantity: 10, unit_price_cents: 5000 }],
    notes: "Entrega expressa",
  };

  it("accepts valid input", () => {
    expect(createQuoteSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts without notes", () => {
    const { notes: _, ...rest } = validInput;
    expect(createQuoteSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects invalid retailer_id", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      retailer_id: "not-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects past valid_until", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      valid_until: "2020-01-01T00:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty items", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects item with quantity 0", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      items: [{ product_id: VALID_UUID, quantity: 0, unit_price_cents: 5000 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects item with negative price", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      items: [{ product_id: VALID_UUID, quantity: 1, unit_price_cents: -100 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes longer than 2000 chars", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      notes: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiple items", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      items: [
        { product_id: VALID_UUID, quantity: 5, unit_price_cents: 1000 },
        {
          product_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          quantity: 3,
          unit_price_cents: 2000,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date string", () => {
    const result = createQuoteSchema.safeParse({
      ...validInput,
      valid_until: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});
