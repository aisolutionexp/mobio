import { z } from "zod";

export const listRetailerQuotesSchema = z.object({
  status: z.string().optional(),
  factory_id: z.string().uuid("Fábrica inválida").optional(),
  page: z.coerce.number().int().min(0).optional(),
});

export const quoteIdSchema = z.string().uuid("Cotação inválida");

export const rejectQuoteSchema = z.object({
  quoteId: z.string().uuid("Cotação inválida"),
  reason: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export const requestRevisionSchema = z.object({
  quoteId: z.string().uuid("Cotação inválida"),
  message: z
    .string()
    .min(1, "Mensagem é obrigatória")
    .max(5000, "Máximo 5000 caracteres"),
});

export const sendQuoteMessageSchema = z.object({
  quoteId: z.string().uuid("Cotação inválida"),
  body: z
    .string()
    .min(1, "Mensagem é obrigatória")
    .max(5000, "Máximo 5000 caracteres"),
});
