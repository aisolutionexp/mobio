import { describe, it, expect } from "vitest";
import {
  quoteIdSchema,
  rejectQuoteSchema,
  requestRevisionSchema,
  sendQuoteMessageSchema,
  listRetailerQuotesSchema,
} from "@/lib/validators/quotes-retailer";

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

describe("quoteIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(quoteIdSchema.safeParse(VALID_UUID).success).toBe(true);
  });

  it("rejects invalid", () => {
    expect(quoteIdSchema.safeParse("bad").success).toBe(false);
  });
});

describe("rejectQuoteSchema", () => {
  it("accepts with reason", () => {
    const result = rejectQuoteSchema.safeParse({
      quoteId: VALID_UUID,
      reason: "Preço alto",
    });
    expect(result.success).toBe(true);
  });

  it("accepts without reason", () => {
    const result = rejectQuoteSchema.safeParse({ quoteId: VALID_UUID });
    expect(result.success).toBe(true);
  });

  it("rejects reason > 2000 chars", () => {
    const result = rejectQuoteSchema.safeParse({
      quoteId: VALID_UUID,
      reason: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("requestRevisionSchema", () => {
  it("accepts valid input", () => {
    const result = requestRevisionSchema.safeParse({
      quoteId: VALID_UUID,
      message: "Preciso de desconto",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty message", () => {
    const result = requestRevisionSchema.safeParse({
      quoteId: VALID_UUID,
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message > 5000 chars", () => {
    const result = requestRevisionSchema.safeParse({
      quoteId: VALID_UUID,
      message: "X".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe("sendQuoteMessageSchema", () => {
  it("accepts valid message", () => {
    const result = sendQuoteMessageSchema.safeParse({
      quoteId: VALID_UUID,
      body: "Olá, tudo bem?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty body", () => {
    const result = sendQuoteMessageSchema.safeParse({
      quoteId: VALID_UUID,
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects body > 5000 chars", () => {
    const result = sendQuoteMessageSchema.safeParse({
      quoteId: VALID_UUID,
      body: "A".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid quoteId", () => {
    const result = sendQuoteMessageSchema.safeParse({
      quoteId: "nope",
      body: "Mensagem",
    });
    expect(result.success).toBe(false);
  });
});

describe("listRetailerQuotesSchema", () => {
  it("accepts empty", () => {
    expect(listRetailerQuotesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts status filter", () => {
    expect(listRetailerQuotesSchema.safeParse({ status: "sent" }).success).toBe(
      true,
    );
  });
});
