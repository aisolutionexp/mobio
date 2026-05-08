import { z } from "zod";

const UF_VALUES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export const retailerAddressSchema = z.object({
  label: z
    .string()
    .min(1, "Nome do endereço é obrigatório")
    .max(100, "Máximo 100 caracteres"),
  recipient_name: z
    .string()
    .min(2, "Nome do destinatário deve ter ao menos 2 caracteres")
    .max(200, "Máximo 200 caracteres"),
  address_line: z
    .string()
    .min(3, "Endereço deve ter ao menos 3 caracteres")
    .max(300, "Máximo 300 caracteres"),
  complement: z.string().max(200, "Máximo 200 caracteres").optional(),
  neighborhood: z
    .string()
    .min(2, "Bairro deve ter ao menos 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  city: z
    .string()
    .min(2, "Cidade deve ter ao menos 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  state: z.enum(UF_VALUES, { message: "UF inválida" }),
  zip_code: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000 ou 00000000"),
  region_id: z.string().uuid("Região inválida").optional(),
  is_default: z.boolean().optional(),
});

export type RetailerAddressInput = z.infer<typeof retailerAddressSchema>;
