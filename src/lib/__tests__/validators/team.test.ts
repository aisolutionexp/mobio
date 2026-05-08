import { describe, it, expect } from "vitest";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "@/lib/validators/team";

describe("inviteMemberSchema", () => {
  it("accepts valid input", () => {
    const result = inviteMemberSchema.safeParse({
      email: "user@example.com",
      role: "atelier_member",
    });
    expect(result.success).toBe(true);
  });

  it("accepts atelier_owner role", () => {
    const result = inviteMemberSchema.safeParse({
      email: "user@example.com",
      role: "atelier_owner",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = inviteMemberSchema.safeParse({
      email: "not-email",
      role: "atelier_member",
    });
    expect(result.success).toBe(false);
  });

  it("accepts lojista roles", () => {
    const ownerResult = inviteMemberSchema.safeParse({
      email: "user@example.com",
      role: "lojista_owner",
    });
    expect(ownerResult.success).toBe(true);

    const buyerResult = inviteMemberSchema.safeParse({
      email: "user@example.com",
      role: "lojista_buyer",
    });
    expect(buyerResult.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = inviteMemberSchema.safeParse({
      email: "user@example.com",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing role", () => {
    const result = inviteMemberSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateMemberRoleSchema", () => {
  it("accepts valid input", () => {
    const result = updateMemberRoleSchema.safeParse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      role: "atelier_owner",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID memberId", () => {
    const result = updateMemberRoleSchema.safeParse({
      memberId: "not-uuid",
      role: "atelier_owner",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = updateMemberRoleSchema.safeParse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });
});
