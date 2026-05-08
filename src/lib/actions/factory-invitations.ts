"use server";

import { revalidatePath } from "next/cache";
import { randomUUID, randomBytes } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { sendFactoryInvitationSchema } from "@/lib/validators/factory-invitations";
import type { ActionResult } from "@/types/actions";

const RETAILERS_PATH = "/atelier/lojistas";

export async function listFactoryInvitations() {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("factory_invitations")
    .select(
      "id, retailer_email, retailer_name, status, expires_at, accepted_at, invited_by, created_at",
    )
    .eq("factory_id", tenantId)
    .order("created_at", { ascending: false })
    .range(0, 49);

  if (error) throw new Error(error.message);
  return data;
}

export async function listAuthorizedRetailers() {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("authorized_retailers")
    .select(
      "factory_id, retailer_id, status, authorized_at, retailers(id, name, slug, logo_path, email)",
    )
    .eq("factory_id", tenantId)
    .eq("status", "active")
    .order("authorized_at", { ascending: false })
    .range(0, 49);

  if (error) throw new Error(error.message);
  return data;
}

export async function sendFactoryInvitation(
  _prevState: ActionResult<{ invitationUrl: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ invitationUrl: string }>> {
  const parsed = sendFactoryInvitationSchema.safeParse({
    retailer_email: formData.get("retailer_email"),
    retailer_name: formData.get("retailer_name"),
    include_terms_snapshot: formData.get("include_terms_snapshot") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId, role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode convidar lojistas",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: existingInvite } = await supabase
      .from("factory_invitations")
      .select("id")
      .eq("factory_id", tenantId)
      .eq("retailer_email", parsed.data.retailer_email)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existingInvite) {
      return {
        success: false,
        error: "Já existe um convite pendente para este email",
      };
    }

    const { data: existingAuth } = await supabase
      .from("authorized_retailers")
      .select("factory_id")
      .eq("factory_id", tenantId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (existingAuth) {
      const { data: retailerByEmail } = await supabase
        .from("retailers")
        .select("id")
        .eq("email", parsed.data.retailer_email)
        .limit(1)
        .maybeSingle();

      if (retailerByEmail) {
        const { data: alreadyAuthorized } = await supabase
          .from("authorized_retailers")
          .select("factory_id")
          .eq("factory_id", tenantId)
          .eq("retailer_id", retailerByEmail.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (alreadyAuthorized) {
          return {
            success: false,
            error: "Este lojista já está autorizado",
          };
        }
      }
    }

    let termsSnapshot = null;
    if (parsed.data.include_terms_snapshot) {
      const { data: settings } = await supabase
        .from("factory_settings")
        .select("payment_terms, shipping_policy, commercial_terms")
        .eq("factory_id", tenantId)
        .maybeSingle();

      if (settings) {
        termsSnapshot = settings;
      }
    }

    const token =
      randomUUID().replace(/-/g, "") + randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invitation, error: insertError } = await supabase
      .from("factory_invitations")
      .insert({
        factory_id: tenantId,
        retailer_email: parsed.data.retailer_email,
        retailer_name: parsed.data.retailer_name,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        terms_snapshot: termsSnapshot,
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.message.includes("unique")) {
        return {
          success: false,
          error: "Já existe um convite pendente para este email",
        };
      }
      return { success: false, error: insertError.message };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const authHeader = (await supabase.auth.getSession()).data.session
          ?.access_token;

        await fetch(`${supabaseUrl}/functions/v1/send-factory-invitation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authHeader}`,
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ invitation_id: invitation.id }),
        });
      } catch {
        // Edge Function call is best-effort for MVP
      }
    }

    const invitationUrl = `${siteUrl}/aceitar-convite-fabrica/${token}`;

    revalidatePath(RETAILERS_PATH);
    return { success: true, data: { invitationUrl } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function revokeFactoryInvitation(
  invitationId: string,
): Promise<ActionResult> {
  try {
    const { role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode revogar convites",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("factory_invitations")
      .update({ status: "revoked" })
      .eq("id", invitationId);

    if (error) return { success: false, error: error.message };

    revalidatePath(RETAILERS_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function revokeAuthorization(
  authorizationFactoryId: string,
  authorizationRetailerId: string,
): Promise<ActionResult> {
  try {
    const { role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode revogar autorizações",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("authorized_retailers")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("factory_id", authorizationFactoryId)
      .eq("retailer_id", authorizationRetailerId);

    if (error) return { success: false, error: error.message };

    revalidatePath(RETAILERS_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function resendFactoryInvitation(
  invitationId: string,
): Promise<ActionResult<{ invitationUrl: string }>> {
  try {
    const { role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode reenviar convites",
      };
    }

    const supabase = await createClient();

    const newToken =
      randomUUID().replace(/-/g, "") + randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase
      .from("factory_invitations")
      .update({
        token: newToken,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .eq("id", invitationId);

    if (error) return { success: false, error: error.message };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const invitationUrl = `${siteUrl}/aceitar-convite-fabrica/${newToken}`;

    revalidatePath(RETAILERS_PATH);
    return { success: true, data: { invitationUrl } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
