import { z } from "zod";

export const searchFactoriesSchema = z.object({
  query: z.string().trim().optional(),
  regionId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(0).default(0),
});

export type SearchFactoriesInput = z.infer<typeof searchFactoriesSchema>;
