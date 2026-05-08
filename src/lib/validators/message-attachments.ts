import { z } from "zod";

export const attachmentIdSchema = z.string().uuid("Anexo inválido");

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const uploadAttachmentSchema = z.object({
  file_name: z.string().min(1, "Nome do arquivo é obrigatório"),
  file_type: z
    .string()
    .refine(
      (type) => (ALLOWED_FILE_TYPES as readonly string[]).includes(type),
      "Tipo de arquivo não permitido. Use: imagem, PDF ou DOCX",
    ),
  file_size: z
    .number()
    .positive("Tamanho inválido")
    .max(MAX_FILE_SIZE, "Arquivo deve ter no máximo 25MB"),
  conversation_id: z.string().uuid("Conversa inválida"),
});

export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;
export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };
