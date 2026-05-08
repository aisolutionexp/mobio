import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupFactorySchema,
  signupRetailerSchema,
} from "@/lib/validators/auth";

describe("loginSchema", () => {
  it("accepts valid email", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("inválido");
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

describe("signupFactorySchema", () => {
  const validInput = {
    email: "factory@example.com",
    factory_name: "Minha Fábrica",
    cnpj: "12.345.678/0001-90",
    region_id: "550e8400-e29b-41d4-a716-446655440000",
    categories: ["550e8400-e29b-41d4-a716-446655440000"],
    responsible_name: "João Silva",
  };

  it("accepts valid input", () => {
    const result = signupFactorySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects invalid CNPJ format", () => {
    const result = signupFactorySchema.safeParse({
      ...validInput,
      cnpj: "12345678000190",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("CNPJ");
  });

  it("rejects empty categories", () => {
    const result = signupFactorySchema.safeParse({
      ...validInput,
      categories: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects short factory name", () => {
    const result = signupFactorySchema.safeParse({
      ...validInput,
      factory_name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional whatsapp", () => {
    const result = signupFactorySchema.safeParse({
      ...validInput,
      whatsapp: "+5511999990000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid region_id", () => {
    const result = signupFactorySchema.safeParse({
      ...validInput,
      region_id: "not-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupRetailerSchema", () => {
  const validInput = {
    email: "loja@example.com",
    retailer_name: "Loja X",
    region_id: "550e8400-e29b-41d4-a716-446655440000",
    responsible_name: "Maria Santos",
  };

  it("accepts valid input without optional fields", () => {
    const result = signupRetailerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts valid CNPJ", () => {
    const result = signupRetailerSchema.safeParse({
      ...validInput,
      cnpj: "12.345.678/0001-90",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty CNPJ string", () => {
    const result = signupRetailerSchema.safeParse({
      ...validInput,
      cnpj: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid CNPJ format", () => {
    const result = signupRetailerSchema.safeParse({
      ...validInput,
      cnpj: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts segments", () => {
    const result = signupRetailerSchema.safeParse({
      ...validInput,
      segments: ["550e8400-e29b-41d4-a716-446655440000"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects short retailer name", () => {
    const result = signupRetailerSchema.safeParse({
      ...validInput,
      retailer_name: "L",
    });
    expect(result.success).toBe(false);
  });
});
