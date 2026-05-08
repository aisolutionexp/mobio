import { z } from "zod";

export const orderIdSchema = z.string().uuid("Pedido inválido");

export const scheduleIdSchema = z.string().uuid("Agenda de pagamento inválida");

export const createPaymentScheduleSchema = z.object({
  orderId: z.string().uuid("Pedido inválido"),
  signalPct: z
    .number()
    .int("Percentual deve ser inteiro")
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
  dueDate: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Data inválida")
    .optional(),
});

export const recordPaymentSchema = z.object({
  scheduleId: z.string().uuid("Agenda de pagamento inválida"),
  amountCents: z
    .number()
    .int("Valor deve ser em centavos")
    .min(1, "Valor deve ser positivo"),
  paymentMethod: z.enum(["pix", "boleto", "transfer", "credit_card", "other"], {
    message: "Método de pagamento inválido",
  }),
  transactionRef: z.string().max(255, "Máximo 255 caracteres").optional(),
});

export const markScheduleStatusSchema = z.object({
  scheduleId: z.string().uuid("Agenda de pagamento inválida"),
  status: z.enum(["pending", "paid", "late", "cancelled"], {
    message: "Status inválido",
  }),
});

export type CreatePaymentScheduleInput = z.infer<
  typeof createPaymentScheduleSchema
>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type MarkScheduleStatusInput = z.infer<typeof markScheduleStatusSchema>;
