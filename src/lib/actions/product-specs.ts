"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import {
  addSpecSchema,
  updateSpecSchema,
  reorderSpecsSchema,
} from "@/lib/validators/catalog";
import type { ActionResult } from "@/types/actions";

export async function listSpecs(productId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      spec_key: string;
      spec_value: string;
      sort_order: number;
    }>
  >
> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("product_specs")
      .select("id, spec_key, spec_value, sort_order")
      .eq("product_id", productId)
      .order("sort_order");

    if (error) return { success: false, error: error.message };

    return { success: true, data: data ?? [] };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function addSpec(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = addSpecSchema.safeParse({
    productId: formData.get("product_id"),
    spec_key: formData.get("spec_key"),
    spec_value: formData.get("spec_value"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", parsed.data.productId)
      .eq("factory_id", tenantId)
      .single();

    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }

    const { data: maxOrderRow } = await supabase
      .from("product_specs")
      .select("sort_order")
      .eq("product_id", parsed.data.productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("product_specs")
      .insert({
        product_id: parsed.data.productId,
        factory_id: tenantId,
        spec_key: parsed.data.spec_key,
        spec_value: parsed.data.spec_value,
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateSpec(
  specId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateSpecSchema.safeParse({
    spec_key: formData.get("spec_key") || undefined,
    spec_value: formData.get("spec_value") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const updateData: {
      spec_key?: string;
      spec_value?: string;
    } = {};
    if (parsed.data.spec_key) updateData.spec_key = parsed.data.spec_key;
    if (parsed.data.spec_value) updateData.spec_value = parsed.data.spec_value;

    const { error } = await supabase
      .from("product_specs")
      .update(updateData)
      .eq("id", specId)
      .eq("factory_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function removeSpec(specId: string): Promise<ActionResult> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("product_specs")
      .delete()
      .eq("id", specId)
      .eq("factory_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function reorderSpecs(input: {
  productId: string;
  ordering: { id: string; sort_order: number }[];
}): Promise<ActionResult> {
  const parsed = reorderSpecsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", parsed.data.productId)
      .eq("factory_id", tenantId)
      .single();

    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }

    const results = await Promise.all(
      parsed.data.ordering.map((item) =>
        supabase
          .from("product_specs")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
          .eq("product_id", parsed.data.productId),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) return { success: false, error: failed.error.message };

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
