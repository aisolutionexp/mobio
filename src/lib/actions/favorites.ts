"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import type { ActionResult } from "@/types/actions";

const uuidSchema = z.string().uuid();

export async function toggleFavoriteFactory(
  factoryId: string,
): Promise<ActionResult<{ favorited: boolean }>> {
  try {
    const parsed = uuidSchema.safeParse(factoryId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Nao autenticado" };

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("retailer_id", tenantId)
      .eq("user_id", user.id)
      .eq("factory_id", parsed.data)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);
      if (error) return { success: false, error: error.message };
      revalidatePath("/lojista/favoritos");
      revalidatePath("/lojista/praca");
      return { success: true, data: { favorited: false } };
    }

    const { error } = await supabase.from("favorites").insert({
      retailer_id: tenantId,
      user_id: user.id,
      factory_id: parsed.data,
    });
    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/favoritos");
    revalidatePath("/lojista/praca");
    return { success: true, data: { favorited: true } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function toggleFavoriteProduct(
  productId: string,
): Promise<ActionResult<{ favorited: boolean }>> {
  try {
    const parsed = uuidSchema.safeParse(productId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Nao autenticado" };

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("retailer_id", tenantId)
      .eq("user_id", user.id)
      .eq("product_id", parsed.data)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);
      if (error) return { success: false, error: error.message };
      revalidatePath("/lojista/favoritos");
      return { success: true, data: { favorited: false } };
    }

    const { error } = await supabase.from("favorites").insert({
      retailer_id: tenantId,
      user_id: user.id,
      product_id: parsed.data,
    });
    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/favoritos");
    return { success: true, data: { favorited: true } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function checkFavorites(factoryIds: string[]) {
  const parsed = z.array(uuidSchema).safeParse(factoryIds);
  if (!parsed.success) return new Set<string>();

  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set<string>();

  const { data } = await supabase
    .from("favorites")
    .select("factory_id")
    .eq("retailer_id", tenantId)
    .eq("user_id", user.id)
    .in("factory_id", parsed.data);

  return new Set((data ?? []).map((f) => f.factory_id).filter(Boolean));
}
