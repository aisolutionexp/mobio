import { describe, it, expect } from "vitest";
import { retailerAddressSchema } from "@/lib/validators/retailer-addresses";

describe("retailerAddressSchema", () => {
  const validInput = {
    label: "Escritório",
    recipient_name: "João Silva",
    address_line: "Rua das Flores, 123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP" as const,
    zip_code: "01001-000",
  };

  it("accepts valid input", () => {
    expect(retailerAddressSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts with complement", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      complement: "Sala 201",
    });
    expect(result.success).toBe(true);
  });

  it("accepts with is_default true", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      is_default: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts zip_code without dash", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      zip_code: "01001000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid zip_code", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      zip_code: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zip_code with letters", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      zip_code: "ABCDE-FGH",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid state", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      state: "XX",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty label", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      label: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short recipient_name", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      recipient_name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short address_line", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      address_line: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short city", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      city: "A",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid region_id UUID", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      region_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid region_id", () => {
    const result = retailerAddressSchema.safeParse({
      ...validInput,
      region_id: "not-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all 27 UF values", () => {
    const UFs = [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ];
    for (const uf of UFs) {
      const result = retailerAddressSchema.safeParse({
        ...validInput,
        state: uf,
      });
      expect(result.success).toBe(true);
    }
  });
});
