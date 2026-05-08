"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import type { ActionResult } from "@/types/actions";

const uuidSchema = z.string().uuid();

const createShareTokenSchema = z.object({
  linesheetId: z.string().uuid("Linesheet inválido"),
  expiresInDays: z.union([z.literal(7), z.literal(30), z.null()]).default(null),
});

export interface ShareTokenData {
  id: string;
  token: string;
  url: string;
  expiresAt: string | null;
  isRevoked: boolean;
  accessCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
}

export async function listShareTokens(
  linesheetId: string,
): Promise<ShareTokenData[]> {
  const parsed = uuidSchema.safeParse(linesheetId);
  if (!parsed.success) return [];

  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: linesheet } = await supabase
    .from("linesheets")
    .select("id")
    .eq("id", parsed.data)
    .eq("retailer_id", tenantId)
    .single();

  if (!linesheet) return [];

  const { data: tokens, error } = await supabase
    .from("linesheet_share_tokens")
    .select(
      "id, token, expires_at, is_revoked, access_count, last_accessed_at, created_at",
    )
    .eq("linesheet_id", parsed.data)
    .order("created_at", { ascending: false });

  if (error || !tokens) return [];

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return tokens.map((t) => ({
    id: t.id,
    token: t.token,
    url: `${baseUrl}/linesheet-publico/${t.token}`,
    expiresAt: t.expires_at,
    isRevoked: t.is_revoked,
    accessCount: t.access_count,
    lastAccessedAt: t.last_accessed_at,
    createdAt: t.created_at,
  }));
}

export async function createShareToken(
  linesheetId: string,
  expiresInDays: 7 | 30 | null = null,
): Promise<ActionResult<{ url: string }>> {
  try {
    const parsed = createShareTokenSchema.safeParse({
      linesheetId,
      expiresInDays,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: linesheet } = await supabase
      .from("linesheets")
      .select("id")
      .eq("id", parsed.data.linesheetId)
      .eq("retailer_id", tenantId)
      .single();

    if (!linesheet) {
      return { success: false, error: "Linesheet não encontrado" };
    }

    const token = crypto.randomBytes(32).toString("hex");

    let expiresAt: string | null = null;
    if (parsed.data.expiresInDays) {
      const date = new Date();
      date.setDate(date.getDate() + parsed.data.expiresInDays);
      expiresAt = date.toISOString();
    }

    const { error } = await supabase.from("linesheet_share_tokens").insert({
      linesheet_id: parsed.data.linesheetId,
      token,
      expires_at: expiresAt,
      created_by: user.id,
    });

    if (error) return { success: false, error: error.message };

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const url = `${baseUrl}/linesheet-publico/${token}`;

    revalidatePath(`/lojista/linesheet/${parsed.data.linesheetId}`);
    return { success: true, data: { url } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function revokeShareToken(tokenId: string): Promise<ActionResult> {
  try {
    const parsed = uuidSchema.safeParse(tokenId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: tokenRow } = await supabase
      .from("linesheet_share_tokens")
      .select("linesheet_id")
      .eq("id", parsed.data)
      .single();

    if (!tokenRow) return { success: false, error: "Token não encontrado" };

    const { error } = await supabase
      .from("linesheet_share_tokens")
      .update({ is_revoked: true })
      .eq("id", parsed.data);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/lojista/linesheet/${tokenRow.linesheet_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
