"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validators/catalog";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types/actions";
import type { Database } from "@/types/database";

export async function createCollection(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createCollectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const slug = slugify(parsed.data.name);

    const { data, error } = await supabase
      .from("collections")
      .insert({
        factory_id: tenantId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        slug,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Já existe uma coleção com esse nome" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/atelier/catalogo");
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateCollection(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateCollectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const updateData: Database["public"]["Tables"]["collections"]["Update"] =
      {};
    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
      updateData.slug = slugify(parsed.data.name);
    }
    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description || null;
    }

    const { error } = await supabase
      .from("collections")
      .update(updateData)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Já existe uma coleção com esse nome" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/atelier/catalogo");
    revalidatePath(`/atelier/catalogo/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function publishCollection(id: string): Promise<ActionResult> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("collection_id", id)
      .eq("status", "published");

    if (!count || count === 0) {
      return {
        success: false,
        error:
          "A coleção precisa ter ao menos 1 produto publicado para ser publicada",
      };
    }

    const { error } = await supabase
      .from("collections")
      .update({ status: "published" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/atelier/catalogo");
    revalidatePath(`/atelier/catalogo/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function archiveCollection(id: string): Promise<ActionResult> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("collections")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/atelier/catalogo");
    revalidatePath(`/atelier/catalogo/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function unarchiveCollection(id: string): Promise<ActionResult> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("collections")
      .update({ status: "draft" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/atelier/catalogo");
    revalidatePath(`/atelier/catalogo/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
