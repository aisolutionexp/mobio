import { describe, it, expect } from "vitest";
import {
  orderIdSchema,
  createPaymentScheduleSchema,
  recordPaymentSchema,
  markScheduleStatusSchema,
} from "@/lib/validators/payments";

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

describe("orderIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(orderIdSchema.safeParse(VALID_UUID).success).toBe(true);
  });

  it("rejects invalid", () => {
    expect(orderIdSchema.safeParse("nope").success).toBe(false);
  });
});

describe("createPaymentScheduleSchema", () => {
  it("accepts valid input", () => {
    const result = createPaymentScheduleSchema.safeParse({
      orderId: VALID_UUID,
      signalPct: 30,
    });
    expect(result.success).toBe(true);
  });

  it("accepts with due date", () => {
    const result = createPaymentScheduleSchema.safeParse({
      orderId: VALID_UUID,
      signalPct: 50,
      dueDate: "2026-06-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects signal > 100", () => {
    const result = createPaymentScheduleSchema.safeParse({
      orderId: VALID_UUID,
      signalPct: 101,
    });
    expect(result.success).toBe(false);
  });

  it("rejects signal < 0", () => {
    const result = createPaymentScheduleSchema.safeParse({
      orderId: VALID_UUID,
      signalPct: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid orderId", () => {
    const result = createPaymentScheduleSchema.safeParse({
      orderId: "bad",
      signalPct: 30,
    });
    expect(result.success).toBe(false);
  });
});

describe("recordPaymentSchema", () => {
  it("accepts valid input", () => {
    const result = recordPaymentSchema.safeParse({
      scheduleId: VALID_UUID,
      amountCents: 50000,
      paymentMethod: "pix",
    });
    expect(result.success).toBe(true);
  });

  it("accepts with transaction ref", () => {
    const result = recordPaymentSchema.safeParse({
      scheduleId: VALID_UUID,
      amountCents: 10000,
      paymentMethod: "boleto",
      transactionRef: "TXN-12345",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = recordPaymentSchema.safeParse({
      scheduleId: VALID_UUID,
      amountCents: 0,
      paymentMethod: "pix",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid payment method", () => {
    const result = recordPaymentSchema.safeParse({
      scheduleId: VALID_UUID,
      amountCents: 1000,
      paymentMethod: "bitcoin",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid payment methods", () => {
    for (const method of [
      "pix",
      "boleto",
      "transfer",
      "credit_card",
      "other",
    ]) {
      const result = recordPaymentSchema.safeParse({
        scheduleId: VALID_UUID,
        amountCents: 1000,
        paymentMethod: method,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("markScheduleStatusSchema", () => {
  it("accepts valid status", () => {
    for (const status of ["pending", "paid", "late", "cancelled"]) {
      const result = markScheduleStatusSchema.safeParse({
        scheduleId: VALID_UUID,
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = markScheduleStatusSchema.safeParse({
      scheduleId: VALID_UUID,
      status: "refunded",
    });
    expect(result.success).toBe(false);
  });
});
