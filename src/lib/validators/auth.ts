import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
});

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const signupFactorySchema = z.object({
  email: z.string().email("Email inválido"),
  factory_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(200, "Nome muito longo"),
  cnpj: z
    .string()
    .regex(CNPJ_REGEX, "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)"),
  region_id: z.string().uuid("Selecione uma região"),
  categories: z
    .array(z.string().uuid())
    .min(1, "Selecione ao menos 1 categoria"),
  whatsapp: z.string().optional(),
  responsible_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
});

export const signupRetailerSchema = z.object({
  email: z.string().email("Email inválido"),
  retailer_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(200, "Nome muito longo"),
  // cnpj: optional até migration adicionar coluna em retailers (ver decisions.md 2026-05-07)
  cnpj: z
    .string()
    .regex(CNPJ_REGEX, "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)")
    .optional()
    .or(z.literal("")),
  region_id: z.string().uuid("Selecione uma região"),
  segments: z.array(z.string().uuid()).optional(),
  whatsapp: z.string().optional(),
  responsible_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFactoryFormData = z.infer<typeof signupFactorySchema>;
export type SignupRetailerFormData = z.infer<typeof signupRetailerSchema>;
