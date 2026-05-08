import { z } from "zod";

export const auditLogFiltersSchema = z.object({
  table: z.string().max(100).optional(),
  actor_user_id: z.string().uuid("ID de ator inválido").optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
});

export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>;

export const auditLogIdSchema = z.string().uuid("ID de log inválido");
