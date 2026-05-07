"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "@/lib/validators/team";
import type { ActionResult } from "@/types/actions";

const TEAM_PATH = "/atelier/conta/equipe";

export async function inviteMember(
  _prevState: ActionResult<{ inviteUrl: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ inviteUrl: string }>> {
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId, role: callerRole } = await requireFactoryAccess();

    if (callerRole !== "atelier_owner" && callerRole !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode convidar membros",
      };
    }

    const supabase = await createClient();

    const { data: existingInvite } = await supabase
      .from("invites")
      .select("id")
      .eq("factory_id", tenantId)
      .eq("email", parsed.data.email)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existingInvite) {
      return {
        success: false,
        error: "Já existe um convite pendente para este email",
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const token =
      randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase.from("invites").insert({
      factory_id: tenantId,
      email: parsed.data.email,
      role: parsed.data.role,
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    });

    if (error) return { success: false, error: error.message };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const inviteUrl = `${siteUrl}/aceitar-convite/${token}`;

    revalidatePath(TEAM_PATH);
    return { success: true, data: { inviteUrl } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateMemberRole(
  memberId: string,
  role: string,
): Promise<ActionResult> {
  const parsed = updateMemberRoleSchema.safeParse({ memberId, role });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { role: callerRole } = await requireFactoryAccess();

    if (callerRole !== "atelier_owner" && callerRole !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode alterar papéis",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("team_members")
      .update({ role: parsed.data.role })
      .eq("id", memberId);

    if (error) return { success: false, error: error.message };

    revalidatePath(TEAM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deactivateMember(
  memberId: string,
): Promise<ActionResult> {
  try {
    const { role: callerRole } = await requireFactoryAccess();

    if (callerRole !== "atelier_owner" && callerRole !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode desativar membros",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: member } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("id", memberId)
      .single();

    if (member?.user_id === user?.id) {
      return { success: false, error: "Você não pode desativar a si mesmo" };
    }

    const { error } = await supabase
      .from("team_members")
      .update({ is_active: false })
      .eq("id", memberId);

    if (error) return { success: false, error: error.message };

    revalidatePath(TEAM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function cancelInvite(inviteId: string): Promise<ActionResult> {
  try {
    const { role: callerRole } = await requireFactoryAccess();

    if (callerRole !== "atelier_owner" && callerRole !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode cancelar convites",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("invites")
      .update({ status: "revoked" })
      .eq("id", inviteId);

    if (error) return { success: false, error: error.message };

    revalidatePath(TEAM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function resendInvite(
  inviteId: string,
): Promise<ActionResult<{ inviteUrl: string }>> {
  try {
    const { role: callerRole } = await requireFactoryAccess();

    if (callerRole !== "atelier_owner" && callerRole !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode reenviar convites",
      };
    }

    const supabase = await createClient();

    const newToken =
      randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase
      .from("invites")
      .update({
        token: newToken,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .eq("id", inviteId);

    if (error) return { success: false, error: error.message };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const inviteUrl = `${siteUrl}/aceitar-convite/${newToken}`;

    revalidatePath(TEAM_PATH);
    return { success: true, data: { inviteUrl } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
