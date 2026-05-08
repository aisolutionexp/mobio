"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  createBoardSchema,
  updateBoardSchema,
  addProductToBoardSchema,
  reorderBoardItemsSchema,
  updateBoardItemNoteSchema,
} from "@/lib/validators/boards";
import type { ActionResult } from "@/types/actions";

const uuidSchema = z.string().uuid();

export async function listRetailerBoards() {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: boards, error } = await supabase
    .from("boards")
    .select(
      "id, name, description, is_public, cover_url, created_at, updated_at",
    )
    .eq("retailer_id", tenantId)
    .order("updated_at", { ascending: false });

  if (error || !boards) return [];

  const boardIds = boards.map((b) => b.id);
  if (boardIds.length === 0) return boards.map((b) => ({ ...b, itemCount: 0 }));

  const { data: counts } = await supabase
    .from("board_items")
    .select("board_id")
    .in("board_id", boardIds);

  const countMap = new Map<string, number>();
  for (const item of counts ?? []) {
    countMap.set(item.board_id, (countMap.get(item.board_id) ?? 0) + 1);
  }

  return boards.map((b) => ({
    ...b,
    itemCount: countMap.get(b.id) ?? 0,
  }));
}

export async function getBoardWithItems(boardId: string) {
  const parsed = uuidSchema.safeParse(boardId);
  if (!parsed.success) return null;

  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select(
      "id, name, description, is_public, cover_url, created_at, updated_at, retailer_id",
    )
    .eq("id", parsed.data)
    .eq("retailer_id", tenantId)
    .single();

  if (boardError || !board) return null;

  const { data: items, error: itemsError } = await supabase
    .from("board_items")
    .select(
      `id, position, note, added_at,
       products(id, name, slug, wholesale_price, retail_price, reference,
         factory_id,
         product_images(path, sort_order, is_cover),
         collections(factories(id, name, slug)))`,
    )
    .eq("board_id", parsed.data)
    .order("position", { ascending: true });

  if (itemsError) return { ...board, items: [] };

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
      reference: string | null;
      factory_id: string;
      product_images: { path: string; sort_order: number; is_cover: boolean }[];
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
      addedAt: item.added_at,
      product: product
        ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            wholesalePrice: product.wholesale_price,
            retailPrice: product.retail_price,
            reference: product.reference,
            factoryName: product.collections?.factories?.name ?? null,
            factorySlug: product.collections?.factories?.slug ?? null,
            coverUrl,
          }
        : null,
    };
  });

  return {
    id: board.id,
    name: board.name,
    description: board.description,
    isPublic: board.is_public ?? false,
    coverUrl: board.cover_url,
    createdAt: board.created_at,
    updatedAt: board.updated_at,
    items: mappedItems,
  };
}

export async function createBoard(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createBoardSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      is_public: formData.get("is_public"),
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
      .from("boards")
      .insert({
        name: parsed.data.name,
        description: parsed.data.description || null,
        is_public: parsed.data.is_public ?? false,
        retailer_id: tenantId,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/boards");
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateBoard(
  boardId: string,
  input: { name?: string; description?: string; is_public?: boolean },
): Promise<ActionResult> {
  try {
    const idParsed = uuidSchema.safeParse(boardId);
    if (!idParsed.success) return { success: false, error: "ID inválido" };

    const parsed = updateBoardSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const updateData: {
      name?: string;
      description?: string | null;
      is_public?: boolean;
    } = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined)
      updateData.description = parsed.data.description || null;
    if (parsed.data.is_public !== undefined)
      updateData.is_public = parsed.data.is_public;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "Nenhum campo para atualizar" };
    }

    const { error } = await supabase
      .from("boards")
      .update(updateData)
      .eq("id", idParsed.data)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/boards");
    revalidatePath(`/lojista/boards/${idParsed.data}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deleteBoard(boardId: string): Promise<ActionResult> {
  try {
    const parsed = uuidSchema.safeParse(boardId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", parsed.data)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/boards");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function addProductToBoard(
  boardId: string,
  productId: string,
): Promise<ActionResult> {
  try {
    const parsed = addProductToBoardSchema.safeParse({ boardId, productId });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("id", parsed.data.boardId)
      .eq("retailer_id", tenantId)
      .single();

    if (!board) return { success: false, error: "Board não encontrado" };

    const { data: existing } = await supabase
      .from("board_items")
      .select("id")
      .eq("board_id", parsed.data.boardId)
      .eq("product_id", parsed.data.productId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Produto já está neste board" };
    }

    const { error } = await supabase.from("board_items").insert({
      board_id: parsed.data.boardId,
      product_id: parsed.data.productId,
      added_by: user.id,
      position: 0,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/boards");
    revalidatePath(`/lojista/boards/${parsed.data.boardId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function removeProductFromBoard(
  boardItemId: string,
): Promise<ActionResult> {
  try {
    const parsed = uuidSchema.safeParse(boardItemId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: item } = await supabase
      .from("board_items")
      .select("board_id")
      .eq("id", parsed.data)
      .single();

    if (!item) return { success: false, error: "Item não encontrado" };

    const { error } = await supabase
      .from("board_items")
      .delete()
      .eq("id", parsed.data);

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/boards");
    revalidatePath(`/lojista/boards/${item.board_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function reorderBoardItems(
  boardId: string,
  ordering: { id: string; position: number }[],
): Promise<ActionResult> {
  try {
    const parsed = reorderBoardItemsSchema.safeParse({ boardId, ordering });
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

    const updates = parsed.data.ordering.map(({ id, position }) =>
      supabase
        .from("board_items")
        .update({ position })
        .eq("id", id)
        .eq("board_id", parsed.data.boardId),
    );
    const results = await Promise.all(updates);
    const updateError = results.find((r) => r.error)?.error;
    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`/lojista/boards/${parsed.data.boardId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateBoardItemNote(
  boardItemId: string,
  note: string | null,
): Promise<ActionResult> {
  try {
    const parsed = updateBoardItemNoteSchema.safeParse({
      boardItemId,
      note,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: item } = await supabase
      .from("board_items")
      .select("board_id")
      .eq("id", parsed.data.boardItemId)
      .single();

    if (!item) return { success: false, error: "Item não encontrado" };

    const { error } = await supabase
      .from("board_items")
      .update({ note: parsed.data.note })
      .eq("id", parsed.data.boardItemId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/lojista/boards/${item.board_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
