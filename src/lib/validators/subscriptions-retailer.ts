import { z } from "zod";

export const changePlanSchema = z.object({
  planId: z.string().uuid("ID de plano inválido"),
});

export type ChangePlanInput = z.infer<typeof changePlanSchema>;
