import { z } from "zod";

export const sendFactoryInvitationSchema = z.object({
  retailer_email: z.string().email("Email inválido"),
  retailer_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  include_terms_snapshot: z.boolean().default(true),
});

export const revokeAuthorizationSchema = z.object({
  authorization_id: z.string().uuid("ID de autorização inválido"),
});

export type SendFactoryInvitationInput = z.infer<
  typeof sendFactoryInvitationSchema
>;
export type RevokeAuthorizationInput = z.infer<
  typeof revokeAuthorizationSchema
>;
