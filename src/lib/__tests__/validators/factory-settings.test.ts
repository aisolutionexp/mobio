import { describe, it, expect } from "vitest";
import {
  paymentTermsSchema,
  shippingPolicySchema,
  commercialTermsSchema,
  factorySettingsSchema,
} from "@/lib/validators/factory-settings";

describe("paymentTermsSchema", () => {
  it("accepts valid input", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: ["pix", "boleto"],
      prazo_dias_default: 30,
      parcelas_max: 3,
      desconto_avista_pct: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty accepted_modes", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: [],
      prazo_dias_default: 30,
      parcelas_max: 3,
      desconto_avista_pct: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid payment mode", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: ["bitcoin"],
      prazo_dias_default: 30,
      parcelas_max: 3,
      desconto_avista_pct: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative prazo", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: ["pix"],
      prazo_dias_default: -1,
      parcelas_max: 3,
      desconto_avista_pct: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects prazo above 180", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: ["pix"],
      prazo_dias_default: 181,
      parcelas_max: 3,
      desconto_avista_pct: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects parcelas_max above 12", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: ["pix"],
      prazo_dias_default: 30,
      parcelas_max: 13,
      desconto_avista_pct: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects desconto above 100%", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: ["pix"],
      prazo_dias_default: 30,
      parcelas_max: 3,
      desconto_avista_pct: 101,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero values for prazo and desconto", () => {
    const result = paymentTermsSchema.safeParse({
      accepted_modes: ["cartao"],
      prazo_dias_default: 0,
      parcelas_max: 1,
      desconto_avista_pct: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("shippingPolicySchema", () => {
  it("accepts valid input", () => {
    const result = shippingPolicySchema.safeParse({
      modes: ["correios"],
      prazo_padrao_dias: 10,
      frete_minimo_cents: 1500,
      regioes_atendidas: ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty modes", () => {
    const result = shippingPolicySchema.safeParse({
      modes: [],
      prazo_padrao_dias: 10,
      frete_minimo_cents: 0,
      regioes_atendidas: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects prazo below 1", () => {
    const result = shippingPolicySchema.safeParse({
      modes: ["transportadora"],
      prazo_padrao_dias: 0,
      frete_minimo_cents: 0,
      regioes_atendidas: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("commercialTermsSchema", () => {
  it("accepts valid input", () => {
    const result = commercialTermsSchema.safeParse({
      pedido_minimo_cents: 50000,
      prazo_entrega_dias: 15,
      observacoes: "Entrega apenas em dias úteis",
    });
    expect(result.success).toBe(true);
  });

  it("accepts without observacoes", () => {
    const result = commercialTermsSchema.safeParse({
      pedido_minimo_cents: 0,
      prazo_entrega_dias: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects observacoes above 2000 chars", () => {
    const result = commercialTermsSchema.safeParse({
      pedido_minimo_cents: 0,
      prazo_entrega_dias: 1,
      observacoes: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("factorySettingsSchema (composed)", () => {
  const validInput = {
    payment_terms: {
      accepted_modes: ["pix", "boleto"],
      prazo_dias_default: 30,
      parcelas_max: 3,
      desconto_avista_pct: 5,
    },
    shipping_policy: {
      modes: ["correios", "transportadora"],
      prazo_padrao_dias: 10,
      frete_minimo_cents: 1500,
      regioes_atendidas: [],
    },
    commercial_terms: {
      pedido_minimo_cents: 50000,
      prazo_entrega_dias: 15,
    },
  };

  it("accepts valid composed input", () => {
    expect(factorySettingsSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects if payment_terms is invalid", () => {
    const result = factorySettingsSchema.safeParse({
      ...validInput,
      payment_terms: { ...validInput.payment_terms, accepted_modes: [] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects if shipping_policy is invalid", () => {
    const result = factorySettingsSchema.safeParse({
      ...validInput,
      shipping_policy: { ...validInput.shipping_policy, modes: [] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects if commercial_terms is invalid", () => {
    const result = factorySettingsSchema.safeParse({
      ...validInput,
      commercial_terms: {
        ...validInput.commercial_terms,
        prazo_entrega_dias: 0,
      },
    });
    expect(result.success).toBe(false);
  });
});
