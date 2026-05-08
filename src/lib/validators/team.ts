import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(
    ["atelier_owner", "atelier_member", "lojista_owner", "lojista_buyer"],
    {
      message: "Selecione um papel",
    },
  ),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid("Membro inválido"),
  role: z.enum(
    ["atelier_owner", "atelier_member", "lojista_owner", "lojista_buyer"],
    {
      message: "Selecione um papel",
    },
  ),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
