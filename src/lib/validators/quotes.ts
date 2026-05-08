import { z } from "zod";

const quoteItemSchema = z.object({
  product_id: z.string().uuid("Produto inválido"),
  quantity: z
    .number()
    .int("Quantidade deve ser inteiro")
    .min(1, "Quantidade mínima é 1"),
  unit_price_cents: z
    .number()
    .int("Preço deve ser em centavos")
    .min(1, "Preço deve ser positivo"),
});

export const createQuoteSchema = z.object({
  retailer_id: z.string().uuid("Lojista inválido"),
  valid_until: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Data inválida")
    .refine(
      (v) => new Date(v) > new Date(),
      "Data de validade deve ser futura",
    ),
  items: z.array(quoteItemSchema).min(1, "Adicione ao menos um item"),
  notes: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
