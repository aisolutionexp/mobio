"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { reorderImagesSchema } from "@/lib/validators/catalog";
import type { ActionResult } from "@/types/actions";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadProductImage(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const file = formData.get("file") as File | null;
    const productId = formData.get("product_id") as string | null;

    if (!file || !productId) {
      return { success: false, error: "Arquivo e produto são obrigatórios" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Formato inválido. Use JPEG, PNG ou WebP",
      };
    }

    if (file.size > MAX_SIZE) {
      return { success: false, error: "Arquivo muito grande. Máximo 10MB" };
    }

    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("factory_id", tenantId)
      .single();

    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const uuid = crypto.randomUUID();
    const storagePath = `${tenantId}/${productId}/${uuid}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-photos")
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: maxOrderRow } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;

    const { data: imageRow, error: insertError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        factory_id: tenantId,
        path: storagePath,
        sort_order: nextOrder,
        is_cover: nextOrder === 0,
      })
      .select("id")
      .single();

    if (insertError) {
      await supabase.storage.from("product-photos").remove([storagePath]);
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: { id: imageRow.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function reorderProductImages(input: {
  productId: string;
  ordering: { id: string; sort_order: number }[];
}): Promise<ActionResult> {
  const parsed = reorderImagesSchema.safeParse(input);
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
          .from("product_images")
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

export async function deleteProductImage(
  imageId: string,
): Promise<ActionResult> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data: image } = await supabase
      .from("product_images")
      .select("id, path, product_id")
      .eq("id", imageId)
      .eq("factory_id", tenantId)
      .single();

    if (!image) {
      return { success: false, error: "Imagem não encontrada" };
    }

    await supabase.storage.from("product-photos").remove([image.path]);

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function setCoverImage(
  productId: string,
  imageId: string,
): Promise<ActionResult> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("factory_id", tenantId)
      .single();

    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }

    const { error: resetError } = await supabase
      .from("product_images")
      .update({ is_cover: false })
      .eq("product_id", productId)
      .eq("is_cover", true);

    if (resetError) return { success: false, error: resetError.message };

    const { error: setError } = await supabase
      .from("product_images")
      .update({ is_cover: true })
      .eq("id", imageId)
      .eq("product_id", productId);

    if (setError) return { success: false, error: setError.message };

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
