import { describe, it, expect } from "vitest";
import {
  subscriptionIdSchema,
  subscribeToPushSchema,
} from "@/lib/validators/push-subscriptions";

describe("subscriptionIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      subscriptionIdSchema.safeParse("550e8400-e29b-41d4-a716-446655440000")
        .success,
    ).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(subscriptionIdSchema.safeParse("xyz").success).toBe(false);
  });
});

describe("subscribeToPushSchema", () => {
  it("accepts valid subscription", () => {
    const result = subscribeToPushSchema.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
      p256dh:
        "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8REfWLU",
      auth: "tBHItJI5svbpC7rN-w5EZQ",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional user_agent", () => {
    const result = subscribeToPushSchema.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
      p256dh: "key123",
      auth: "auth123",
      user_agent: "Mozilla/5.0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid endpoint URL", () => {
    const result = subscribeToPushSchema.safeParse({
      endpoint: "not-a-url",
      p256dh: "key",
      auth: "auth",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty p256dh", () => {
    const result = subscribeToPushSchema.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      p256dh: "",
      auth: "auth",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty auth", () => {
    const result = subscribeToPushSchema.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      p256dh: "key",
      auth: "",
    });
    expect(result.success).toBe(false);
  });
});
