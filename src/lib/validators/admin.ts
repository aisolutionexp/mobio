import { z } from "zod";

export const verifyRetailerSchema = z.object({
  retailerId: z.string().uuid("ID do lojista inválido"),
  decision: z.enum(["verified", "rejected"], {
    message: "Decisão deve ser 'verified' ou 'rejected'",
  }),
  notes: z
    .string()
    .max(500, "Notas devem ter no máximo 500 caracteres")
    .optional(),
});

export type VerifyRetailerInput = z.infer<typeof verifyRetailerSchema>;

export const retailerFiltersSchema = z.object({
  verification_status: z
    .enum(["unverified", "pending", "verified", "rejected"])
    .optional(),
  query: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type RetailerFilters = z.infer<typeof retailerFiltersSchema>;
