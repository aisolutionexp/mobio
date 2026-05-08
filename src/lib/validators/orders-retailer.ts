import { z } from "zod";

export const listRetailerOrdersSchema = z.object({
  status: z.string().optional(),
  factory_id: z.string().uuid("Fábrica inválida").optional(),
  page: z.coerce.number().int().min(0).optional(),
});

export const orderIdSchema = z.string().uuid("Pedido inválido");
