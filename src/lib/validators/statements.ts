import { z } from "zod";

export const statementIdSchema = z.string().uuid("ID de statement inválido");

export const generateStatementsSchema = z.object({
  periodStart: z.string().date("Data de início inválida"),
});

export type GenerateStatementsInput = z.infer<typeof generateStatementsSchema>;
