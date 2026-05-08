import { z } from "zod";

export const conversationIdSchema = z.string().uuid("Conversa inválida");
export const messageIdSchema = z.string().uuid("Mensagem inválida");

export const getOrCreateConversationSchema = z.object({
  factory_id: z.string().uuid("Fábrica inválida"),
  retailer_id: z.string().uuid("Lojista inválido"),
  context_type: z
    .enum(["general", "quote", "order", "showroom_booking"])
    .optional()
    .default("general"),
  context_id: z.string().uuid("Contexto inválido").optional(),
});

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid("Conversa inválida"),
  body: z
    .string()
    .min(1, "Mensagem não pode ser vazia")
    .max(5000, "Máximo 5000 caracteres"),
  attachment_ids: z.array(z.string().uuid("Anexo inválido")).optional(),
});

export const searchMessagesSchema = z.object({
  query: z.string().min(2, "Busca deve ter ao menos 2 caracteres").max(200),
  conversation_id: z.string().uuid("Conversa inválida").optional(),
});

export type GetOrCreateConversationInput = z.infer<
  typeof getOrCreateConversationSchema
>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;
