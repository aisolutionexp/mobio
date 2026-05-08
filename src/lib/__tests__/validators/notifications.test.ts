import { describe, it, expect } from "vitest";
import {
  notificationIdSchema,
  listNotificationsSchema,
} from "@/lib/validators/notifications";

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

describe("notificationIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(notificationIdSchema.safeParse(VALID_UUID).success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(notificationIdSchema.safeParse("not-uuid").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(notificationIdSchema.safeParse("").success).toBe(false);
  });
});

describe("listNotificationsSchema", () => {
  it("accepts empty object", () => {
    expect(listNotificationsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts unreadOnly true", () => {
    expect(
      listNotificationsSchema.safeParse({ unreadOnly: true }).success,
    ).toBe(true);
  });

  it("accepts page number", () => {
    expect(listNotificationsSchema.safeParse({ page: 2 }).success).toBe(true);
  });

  it("rejects negative page", () => {
    expect(listNotificationsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts combined filters", () => {
    const result = listNotificationsSchema.safeParse({
      unreadOnly: false,
      page: 0,
    });
    expect(result.success).toBe(true);
  });
});
