import { z } from "zod";

const paymentMode = z.enum(["pix", "boleto", "cartao"]);

export const paymentTermsSchema = z.object({
  accepted_modes: z
    .array(paymentMode)
    .min(1, "Selecione ao menos uma forma de pagamento"),
  prazo_dias_default: z
    .number()
    .int()
    .min(0, "Prazo deve ser positivo")
    .max(180, "Prazo máximo é 180 dias"),
  parcelas_max: z
    .number()
    .int()
    .min(1, "Mínimo 1 parcela")
    .max(12, "Máximo 12 parcelas"),
  desconto_avista_pct: z
    .number()
    .min(0, "Desconto não pode ser negativo")
    .max(100, "Desconto máximo é 100%"),
});

const shippingMode = z.enum(["correios", "transportadora", "retirada"]);

export const shippingPolicySchema = z.object({
  modes: z.array(shippingMode).min(1, "Selecione ao menos um modo de envio"),
  prazo_padrao_dias: z
    .number()
    .int()
    .min(1, "Prazo mínimo é 1 dia")
    .max(120, "Prazo máximo é 120 dias"),
  frete_minimo_cents: z
    .number()
    .int()
    .min(0, "Frete mínimo não pode ser negativo"),
  regioes_atendidas: z.array(z.string().uuid()),
});

export const commercialTermsSchema = z.object({
  pedido_minimo_cents: z
    .number()
    .int()
    .min(0, "Pedido mínimo não pode ser negativo"),
  prazo_entrega_dias: z
    .number()
    .int()
    .min(1, "Prazo mínimo é 1 dia")
    .max(180, "Prazo máximo é 180 dias"),
  observacoes: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export const factorySettingsSchema = z.object({
  payment_terms: paymentTermsSchema,
  shipping_policy: shippingPolicySchema,
  commercial_terms: commercialTermsSchema,
});

export type PaymentTerms = z.infer<typeof paymentTermsSchema>;
export type ShippingPolicy = z.infer<typeof shippingPolicySchema>;
export type CommercialTerms = z.infer<typeof commercialTermsSchema>;
export type FactorySettingsInput = z.infer<typeof factorySettingsSchema>;
