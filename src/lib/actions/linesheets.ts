"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  createLinesheetSchema,
  updateLinesheetSchema,
  addProductToLinesheetSchema,
  reorderLinesheetItemsSchema,
  updateLinesheetItemNoteSchema,
  updateLinesheetItemCustomPriceSchema,
  importBoardToLinesheetSchema,
} from "@/lib/validators/linesheets";
import type { ActionResult } from "@/types/actions";

const uuidSchema = z.string().uuid();

export async function listRetailerLinesheets() {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: linesheets, error } = await supabase
    .from("linesheets")
    .select(
      "id, name, description, pricing_variant, status, created_at, updated_at",
    )
    .eq("retailer_id", tenantId)
    .order("updated_at", { ascending: false });

  if (error || !linesheets) return [];

  const linesheetIds = linesheets.map((l) => l.id);
  if (linesheetIds.length === 0)
    return linesheets.map((l) => ({ ...l, itemCount: 0 }));

  const { data: counts } = await supabase
    .from("linesheet_items")
    .select("linesheet_id")
    .in("linesheet_id", linesheetIds);

  const countMap = new Map<string, number>();
  for (const item of counts ?? []) {
    countMap.set(item.linesheet_id, (countMap.get(item.linesheet_id) ?? 0) + 1);
  }

  return linesheets.map((l) => ({
    ...l,
    itemCount: countMap.get(l.id) ?? 0,
  }));
}

export async function getLinesheetWithItems(linesheetId: string) {
  const parsed = uuidSchema.safeParse(linesheetId);
  if (!parsed.success) return null;

  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: linesheet, error: lsError } = await supabase
    .from("linesheets")
    .select(
      "id, name, description, pricing_variant, status, created_at, updated_at, retailer_id",
    )
    .eq("id", parsed.data)
    .eq("retailer_id", tenantId)
    .single();

  if (lsError || !linesheet) return null;

  const { data: items, error: itemsError } = await supabase
    .from("linesheet_items")
    .select(
      `id, position, note, custom_price, created_at,
       products(id, name, slug, wholesale_price, retail_price, msrp, reference,
         factory_id,
         product_images(path, sort_order, is_cover),
         collections(factories(id, name, slug)))`,
    )
    .eq("linesheet_id", parsed.data)
    .order("position", { ascending: true });

  if (itemsError) {
    return {
      id: linesheet.id,
      name: linesheet.name,
      description: linesheet.description,
      pricingVariant: linesheet.pricing_variant,
      status: linesheet.status,
      createdAt: linesheet.created_at,
      updatedAt: linesheet.updated_at,
      items: [] as {
        id: string;
        position: number;
        note: string | null;
        customPrice: number | null;
        createdAt: string;
        product: {
          id: string;
          name: string;
          slug: string;
          wholesalePrice: number | null;
          retailPrice: number | null;
          msrp: number | null;
          reference: string | null;
          factoryName: string | null;
          factorySlug: string | null;
          coverUrl: string | null;
        } | null;
      }[],
    };
  }

  const allPaths: string[] = [];
  for (const item of items ?? []) {
    const product = item.products as {
      product_images: { path: string; sort_order: number; is_cover: boolean }[];
    } | null;
    if (product?.product_images?.length) {
      const cover =
        product.product_images.find((i) => i.is_cover) ??
        [...product.product_images].sort(
          (a, b) => a.sort_order - b.sort_order,
        )[0];
      if (cover) allPaths.push(cover.path);
    }
  }

  const signedUrlMap = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: signedData } = await supabase.storage
      .from("product-photos")
      .createSignedUrls(allPaths, 3600);

    if (signedData) {
      for (const entry of signedData) {
        if (entry.signedUrl) {
          signedUrlMap.set(entry.path!, entry.signedUrl);
        }
      }
    }
  }

  const mappedItems = (items ?? []).map((item) => {
    const product = item.products as {
      id: string;
      name: string;
      slug: string;
      wholesale_price: number | null;
      retail_price: number | null;
      msrp: number | null;
      reference: string | null;
      factory_id: string;
      product_images: {
        path: string;
        sort_order: number;
        is_cover: boolean;
      }[];
      collections: {
        factories: { id: string; name: string; slug: string };
      } | null;
    } | null;

    let coverUrl: string | null = null;
    if (product?.product_images?.length) {
      const cover =
        product.product_images.find((i) => i.is_cover) ??
        [...product.product_images].sort(
          (a, b) => a.sort_order - b.sort_order,
        )[0];
      if (cover) coverUrl = signedUrlMap.get(cover.path) ?? null;
    }

    return {
      id: item.id,
      position: item.position,
      note: item.note,
      customPrice: item.custom_price,
      createdAt: item.created_at,
      product: product
        ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            wholesalePrice: product.wholesale_price,
            retailPrice: product.retail_price,
            msrp: product.msrp,
            reference: product.reference,
            factoryName: product.collections?.factories?.name ?? null,
            factorySlug: product.collections?.factories?.slug ?? null,
            coverUrl,
          }
        : null,
    };
  });

  return {
    id: linesheet.id,
    name: linesheet.name,
    description: linesheet.description,
    pricingVariant: linesheet.pricing_variant,
    status: linesheet.status,
    createdAt: linesheet.created_at,
    updatedAt: linesheet.updated_at,
    items: mappedItems,
  };
}

export async function createLinesheet(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createLinesheetSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      pricing_variant: formData.get("pricing_variant"),
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

    const { data, error } = await supabase
      .from("linesheets")
      .insert({
        name: parsed.data.name,
        description: parsed.data.description || null,
        pricing_variant: parsed.data.pricing_variant,
        retailer_id: tenantId,
        created_by: user.id,
        type: "public",
        status: "active",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/linesheet");
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateLinesheet(
  linesheetId: string,
  input: {
    name?: string;
    description?: string;
    pricing_variant?: string;
  },
): Promise<ActionResult> {
  try {
    const idParsed = uuidSchema.safeParse(linesheetId);
    if (!idParsed.success) return { success: false, error: "ID inválido" };

    const parsed = updateLinesheetSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const updateData: {
      name?: string;
      description?: string | null;
      pricing_variant?: string;
    } = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined)
      updateData.description = parsed.data.description || null;
    if (parsed.data.pricing_variant !== undefined)
      updateData.pricing_variant = parsed.data.pricing_variant;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "Nenhum campo para atualizar" };
    }

    const { error } = await supabase
      .from("linesheets")
      .update(updateData)
      .eq("id", idParsed.data)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/linesheet");
    revalidatePath(`/lojista/linesheet/${idParsed.data}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deleteLinesheet(
  linesheetId: string,
): Promise<ActionResult> {
  try {
    const parsed = uuidSchema.safeParse(linesheetId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("linesheets")
      .delete()
      .eq("id", parsed.data)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/linesheet");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function addProductToLinesheet(
  linesheetId: string,
  productId: string,
  customPrice?: number,
): Promise<ActionResult> {
  try {
    const parsed = addProductToLinesheetSchema.safeParse({
      linesheetId,
      productId,
      customPrice,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: linesheet } = await supabase
      .from("linesheets")
      .select("id")
      .eq("id", parsed.data.linesheetId)
      .eq("retailer_id", tenantId)
      .single();

    if (!linesheet)
      return { success: false, error: "Linesheet não encontrado" };

    const { data: existing } = await supabase
      .from("linesheet_items")
      .select("id")
      .eq("linesheet_id", parsed.data.linesheetId)
      .eq("product_id", parsed.data.productId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Produto já está neste linesheet" };
    }

    const { error } = await supabase.from("linesheet_items").insert({
      linesheet_id: parsed.data.linesheetId,
      product_id: parsed.data.productId,
      custom_price: parsed.data.customPrice ?? null,
      position: 0,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/linesheet");
    revalidatePath(`/lojista/linesheet/${parsed.data.linesheetId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function removeLinesheetItem(
  itemId: string,
): Promise<ActionResult> {
  try {
    const parsed = uuidSchema.safeParse(itemId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: item } = await supabase
      .from("linesheet_items")
      .select("linesheet_id")
      .eq("id", parsed.data)
      .single();

    if (!item) return { success: false, error: "Item não encontrado" };

    const { error } = await supabase
      .from("linesheet_items")
      .delete()
      .eq("id", parsed.data);

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/linesheet");
    revalidatePath(`/lojista/linesheet/${item.linesheet_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function reorderLinesheetItems(
  linesheetId: string,
  ordering: { id: string; position: number }[],
): Promise<ActionResult> {
  try {
    const parsed = reorderLinesheetItemsSchema.safeParse({
      linesheetId,
      ordering,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: linesheet } = await supabase
      .from("linesheets")
      .select("id")
      .eq("id", parsed.data.linesheetId)
      .eq("retailer_id", tenantId)
      .single();

    if (!linesheet)
      return { success: false, error: "Linesheet não encontrado" };

    const updates = parsed.data.ordering.map(({ id, position }) =>
      supabase
        .from("linesheet_items")
        .update({ position })
        .eq("id", id)
        .eq("linesheet_id", parsed.data.linesheetId),
    );
    const results = await Promise.all(updates);
    const updateError = results.find((r) => r.error)?.error;
    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`/lojista/linesheet/${parsed.data.linesheetId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateLinesheetItemNote(
  itemId: string,
  note: string | null,
): Promise<ActionResult> {
  try {
    const parsed = updateLinesheetItemNoteSchema.safeParse({ itemId, note });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: item } = await supabase
      .from("linesheet_items")
      .select("linesheet_id")
      .eq("id", parsed.data.itemId)
      .single();

    if (!item) return { success: false, error: "Item não encontrado" };

    const { error } = await supabase
      .from("linesheet_items")
      .update({ note: parsed.data.note })
      .eq("id", parsed.data.itemId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/lojista/linesheet/${item.linesheet_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateLinesheetItemCustomPrice(
  itemId: string,
  customPrice: number,
): Promise<ActionResult> {
  try {
    const parsed = updateLinesheetItemCustomPriceSchema.safeParse({
      itemId,
      customPrice,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: item } = await supabase
      .from("linesheet_items")
      .select("linesheet_id")
      .eq("id", parsed.data.itemId)
      .single();

    if (!item) return { success: false, error: "Item não encontrado" };

    const { error } = await supabase
      .from("linesheet_items")
      .update({ custom_price: parsed.data.customPrice })
      .eq("id", parsed.data.itemId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/lojista/linesheet/${item.linesheet_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function listAvailableProducts(linesheetId: string) {
  const parsed = uuidSchema.safeParse(linesheetId);
  if (!parsed.success) return [];

  await requireRetailerAccess();
  const supabase = await createClient();

  const { data: existingItems } = await supabase
    .from("linesheet_items")
    .select("product_id")
    .eq("linesheet_id", parsed.data);

  const existingProductIds = new Set(
    (existingItems ?? []).map((i) => i.product_id),
  );

  const { data: products } = await supabase
    .from("products")
    .select(
      `id, name, reference, factory_id,
       collections(factories(name))`,
    )
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(200);

  if (!products) return [];

  return products
    .filter((p) => !existingProductIds.has(p.id))
    .map((p) => {
      const collection = p.collections as {
        factories: { name: string };
      } | null;
      return {
        id: p.id,
        name: p.name,
        reference: p.reference,
        factoryName: collection?.factories?.name ?? null,
      };
    });
}

export async function importBoardToLinesheet(
  boardId: string,
  linesheetId: string,
): Promise<ActionResult<{ imported: number }>> {
  try {
    const parsed = importBoardToLinesheetSchema.safeParse({
      boardId,
      linesheetId,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("id", parsed.data.boardId)
      .eq("retailer_id", tenantId)
      .single();

    if (!board) return { success: false, error: "Board não encontrado" };

    const { data: linesheet } = await supabase
      .from("linesheets")
      .select("id")
      .eq("id", parsed.data.linesheetId)
      .eq("retailer_id", tenantId)
      .single();

    if (!linesheet)
      return { success: false, error: "Linesheet não encontrado" };

    const { data: boardItems } = await supabase
      .from("board_items")
      .select("product_id, position, note")
      .eq("board_id", parsed.data.boardId)
      .order("position", { ascending: true });

    if (!boardItems || boardItems.length === 0) {
      return { success: false, error: "Board vazio" };
    }

    const { data: existingItems } = await supabase
      .from("linesheet_items")
      .select("product_id")
      .eq("linesheet_id", parsed.data.linesheetId);

    const existingProductIds = new Set(
      (existingItems ?? []).map((i) => i.product_id),
    );

    const { data: maxPosData } = await supabase
      .from("linesheet_items")
      .select("position")
      .eq("linesheet_id", parsed.data.linesheetId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextPosition = (maxPosData?.position ?? 0) + 1;

    const toInsert = boardItems
      .filter((bi) => !existingProductIds.has(bi.product_id))
      .map((bi) => ({
        linesheet_id: parsed.data.linesheetId,
        product_id: bi.product_id,
        position: nextPosition++,
        note: bi.note,
      }));

    if (toInsert.length === 0) {
      return {
        success: false,
        error: "Todos os produtos do board já estão no linesheet",
      };
    }

    const { error } = await supabase.from("linesheet_items").insert(toInsert);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/lojista/linesheet/${parsed.data.linesheetId}`);
    return { success: true, data: { imported: toInsert.length } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
