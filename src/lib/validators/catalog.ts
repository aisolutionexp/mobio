import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export const updateCollectionSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export const createProductSchema = z.object({
  collection_id: z.string().uuid("Coleção inválida"),
  name: z
    .string()
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  sku: z
    .string()
    .min(3, "SKU deve ter ao menos 3 caracteres")
    .max(50, "SKU deve ter no máximo 50 caracteres"),
  description: z
    .string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  wholesale_price: z.coerce
    .number()
    .positive("Preço deve ser positivo")
    .optional(),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres")
    .optional(),
  sku: z
    .string()
    .min(3, "SKU deve ter ao menos 3 caracteres")
    .max(50, "SKU deve ter no máximo 50 caracteres")
    .optional(),
  description: z
    .string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  wholesale_price: z.coerce
    .number()
    .positive("Preço deve ser positivo")
    .optional(),
});

export const reorderImagesSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  ordering: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int().min(0),
    }),
  ),
});

export const addFinishSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export const addSpecSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  spec_key: z
    .string()
    .min(1, "Rótulo é obrigatório")
    .max(100, "Rótulo deve ter no máximo 100 caracteres"),
  spec_value: z
    .string()
    .min(1, "Valor é obrigatório")
    .max(500, "Valor deve ter no máximo 500 caracteres"),
});

export const updateSpecSchema = z.object({
  spec_key: z
    .string()
    .min(1, "Rótulo é obrigatório")
    .max(100, "Rótulo deve ter no máximo 100 caracteres")
    .optional(),
  spec_value: z
    .string()
    .min(1, "Valor é obrigatório")
    .max(500, "Valor deve ter no máximo 500 caracteres")
    .optional(),
});

export const reorderSpecsSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  ordering: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int().min(0),
    }),
  ),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
export type AddFinishInput = z.infer<typeof addFinishSchema>;
export type AddSpecInput = z.infer<typeof addSpecSchema>;
export type UpdateSpecInput = z.infer<typeof updateSpecSchema>;
export type ReorderSpecsInput = z.infer<typeof reorderSpecsSchema>;
