import { z } from "zod";

export const pricingVariantSchema = z.enum(["retailer", "msrp", "custom"]);

export const createLinesheetSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  pricing_variant: pricingVariantSchema.default("retailer"),
});

export const updateLinesheetSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  pricing_variant: pricingVariantSchema.optional(),
});

export const addProductToLinesheetSchema = z.object({
  linesheetId: z.string().uuid("Linesheet inválido"),
  productId: z.string().uuid("Produto inválido"),
  customPrice: z.coerce.number().positive("Preço deve ser positivo").optional(),
});

export const reorderLinesheetItemsSchema = z.object({
  linesheetId: z.string().uuid("Linesheet inválido"),
  ordering: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(0),
    }),
  ),
});

export const updateLinesheetItemNoteSchema = z.object({
  itemId: z.string().uuid("Item inválido"),
  note: z
    .string()
    .max(1000, "Nota deve ter no máximo 1000 caracteres")
    .nullable(),
});

export const updateLinesheetItemCustomPriceSchema = z.object({
  itemId: z.string().uuid("Item inválido"),
  customPrice: z.coerce.number().positive("Preço deve ser positivo"),
});

export const importBoardToLinesheetSchema = z.object({
  boardId: z.string().uuid("Board inválido"),
  linesheetId: z.string().uuid("Linesheet inválido"),
});

export type CreateLinesheetInput = z.infer<typeof createLinesheetSchema>;
export type UpdateLinesheetInput = z.infer<typeof updateLinesheetSchema>;
export type AddProductToLinesheetInput = z.infer<
  typeof addProductToLinesheetSchema
>;
export type ReorderLinesheetItemsInput = z.infer<
  typeof reorderLinesheetItemsSchema
>;
export type UpdateLinesheetItemNoteInput = z.infer<
  typeof updateLinesheetItemNoteSchema
>;
export type UpdateLinesheetItemCustomPriceInput = z.infer<
  typeof updateLinesheetItemCustomPriceSchema
>;
export type ImportBoardToLinesheetInput = z.infer<
  typeof importBoardToLinesheetSchema
>;
