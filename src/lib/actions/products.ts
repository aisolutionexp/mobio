"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import {
  createProductSchema,
  updateProductSchema,
} from "@/lib/validators/catalog";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types/actions";
import type { Database } from "@/types/database";

export async function createProduct(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createProductSchema.safeParse({
    collection_id: formData.get("collection_id"),
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    wholesale_price: formData.get("wholesale_price") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const slug = slugify(parsed.data.name);

    const { data, error } = await supabase
      .from("products")
      .insert({
        factory_id: tenantId,
        collection_id: parsed.data.collection_id,
        name: parsed.data.name,
        reference: parsed.data.sku,
        description: parsed.data.description || null,
        wholesale_price: parsed.data.wholesale_price ?? null,
        slug,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Já existe um produto com esse nome" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath(`/atelier/catalogo/${parsed.data.collection_id}`);
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateProduct(
  id: string,
  collectionId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    wholesale_price: formData.get("wholesale_price") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const updateData: Database["public"]["Tables"]["products"]["Update"] = {};
    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
      updateData.slug = slugify(parsed.data.name);
    }
    if (parsed.data.sku !== undefined) updateData.reference = parsed.data.sku;
    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description || null;
    }
    if (parsed.data.wholesale_price !== undefined) {
      updateData.wholesale_price = parsed.data.wholesale_price;
    }

    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Já existe um produto com esse nome" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath(`/atelier/catalogo/${collectionId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function publishProduct(
  id: string,
  collectionId: string,
): Promise<ActionResult> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id);

    if (!count || count === 0) {
      return {
        success: false,
        error: "O produto precisa ter ao menos 1 imagem para ser publicado",
      };
    }

    const { data: coverImage } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", id)
      .eq("is_cover", true)
      .limit(1)
      .single();

    if (!coverImage) {
      const { error: coverError } = await supabase
        .from("product_images")
        .update({ is_cover: true })
        .eq("product_id", id)
        .order("sort_order", { ascending: true })
        .limit(1);

      if (coverError) {
        return { success: false, error: coverError.message };
      }
    }

    const { error } = await supabase
      .from("products")
      .update({ status: "published" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo/${collectionId}`);
    revalidatePath(`/atelier/catalogo/${collectionId}/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function archiveProduct(
  id: string,
  collectionId: string,
): Promise<ActionResult> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo/${collectionId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function unarchiveProduct(
  id: string,
  collectionId: string,
): Promise<ActionResult> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .update({ status: "draft" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo/${collectionId}`);
    revalidatePath(`/atelier/catalogo/${collectionId}/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
