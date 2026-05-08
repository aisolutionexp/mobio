import { describe, it, expect } from "vitest";
import { sendFactoryInvitationSchema } from "@/lib/validators/factory-invitations";

describe("sendFactoryInvitationSchema", () => {
  it("accepts valid input", () => {
    const result = sendFactoryInvitationSchema.safeParse({
      retailer_email: "lojista@example.com",
      retailer_name: "Loja do Centro",
      include_terms_snapshot: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts without include_terms_snapshot", () => {
    const result = sendFactoryInvitationSchema.safeParse({
      retailer_email: "lojista@example.com",
      retailer_name: "Loja do Centro",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = sendFactoryInvitationSchema.safeParse({
      retailer_email: "not-an-email",
      retailer_name: "Loja",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = sendFactoryInvitationSchema.safeParse({
      retailer_email: "a@b.com",
      retailer_name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 200 chars", () => {
    const result = sendFactoryInvitationSchema.safeParse({
      retailer_email: "a@b.com",
      retailer_name: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = sendFactoryInvitationSchema.safeParse({
      retailer_email: "",
      retailer_name: "Loja",
    });
    expect(result.success).toBe(false);
  });
});
