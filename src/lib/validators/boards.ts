import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  is_public: z.coerce.boolean().optional(),
});

export const updateBoardSchema = z.object({
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
  is_public: z.coerce.boolean().optional(),
});

export const addProductToBoardSchema = z.object({
  boardId: z.string().uuid("Board inválido"),
  productId: z.string().uuid("Produto inválido"),
});

export const reorderBoardItemsSchema = z.object({
  boardId: z.string().uuid("Board inválido"),
  ordering: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(0),
    }),
  ),
});

export const updateBoardItemNoteSchema = z.object({
  boardItemId: z.string().uuid("Item inválido"),
  note: z
    .string()
    .max(500, "Nota deve ter no máximo 500 caracteres")
    .nullable(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type AddProductToBoardInput = z.infer<typeof addProductToBoardSchema>;
export type ReorderBoardItemsInput = z.infer<typeof reorderBoardItemsSchema>;
export type UpdateBoardItemNoteInput = z.infer<
  typeof updateBoardItemNoteSchema
>;
