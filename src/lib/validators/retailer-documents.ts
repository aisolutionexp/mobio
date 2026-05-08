import { z } from "zod";

export const documentIdSchema = z.string().uuid("Documento inválido");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

const DOC_TYPE_VALUES = [
  "cnpj_card",
  "contrato_social",
  "inscricao_estadual",
  "outros",
] as const;

export const uploadRetailerDocumentSchema = z.object({
  doc_type: z.enum(DOC_TYPE_VALUES, {
    message: "Tipo de documento inválido",
  }),
  file_name: z.string().min(1, "Nome do arquivo é obrigatório"),
  file_type: z
    .string()
    .refine(
      (type) => (ALLOWED_DOC_TYPES as readonly string[]).includes(type),
      "Tipo de arquivo não permitido. Use: PDF, JPEG ou PNG",
    ),
  file_size: z
    .number()
    .positive("Tamanho inválido")
    .max(MAX_FILE_SIZE, "Arquivo deve ter no máximo 10MB"),
});

export type UploadRetailerDocumentInput = z.infer<
  typeof uploadRetailerDocumentSchema
>;
export { MAX_FILE_SIZE, ALLOWED_DOC_TYPES, DOC_TYPE_VALUES };
