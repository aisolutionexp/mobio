"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  quoteIdSchema,
  rejectQuoteSchema,
  requestRevisionSchema,
  sendQuoteMessageSchema,
} from "@/lib/validators/quotes-retailer";
import type { ActionResult } from "@/types/actions";

const QUOTES_PATH = "/lojista/pedidos/quotes";

export async function listRetailerQuotes(filters?: {
  status?: string;
  factory_id?: string;
  page?: number;
}) {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const page = filters?.page ?? 0;
  const pageSize = 50;

  let query = supabase
    .from("quotes")
    .select(
      "id, status, total_cents, currency, valid_until, created_at, updated_at, notes, factory_id, factories(id, name, slug, logo_path, region_id, regions(name))",
    )
    .eq("retailer_id", tenantId)
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.factory_id) {
    query = query.eq("factory_id", filters.factory_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getRetailerQuoteWithItems(quoteId: string) {
  const parsed = quoteIdSchema.safeParse(quoteId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select(
      "*, factories(id, name, slug, logo_path, email, region_id, regions(name)), quote_items(id, product_id, quantity, unit_price_cents, products(id, name, reference))",
    )
    .eq("id", parsed.data)
    .eq("retailer_id", tenantId)
    .neq("status", "draft")
    .single();

  if (error) throw new Error(error.message);
  return quote;
}

export async function listRetailerQuoteMessages(quoteId: string) {
  const parsed = quoteIdSchema.safeParse(quoteId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id")
    .eq("id", parsed.data)
    .eq("retailer_id", tenantId)
    .neq("status", "draft")
    .single();

  if (quoteError || !quote) throw new Error("Cotação não encontrada");

  const { data, error } = await supabase
    .from("quote_messages")
    .select(
      "id, body, is_read, created_at, sender_user_id, profiles(id, full_name, avatar_path)",
    )
    .eq("quote_id", parsed.data)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function sendRetailerQuoteMessage(
  quoteId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const parsed = sendQuoteMessageSchema.safeParse({ quoteId, body });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("status")
      .eq("id", parsed.data.quoteId)
      .eq("retailer_id", tenantId)
      .neq("status", "draft")
      .single();

    if (quoteError || !quote) {
      return { success: false, error: "Cotação não encontrada" };
    }

    const { error } = await supabase.from("quote_messages").insert({
      quote_id: parsed.data.quoteId,
      sender_user_id: user.id,
      body: parsed.data.body,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath(QUOTES_PATH);
    revalidatePath(`${QUOTES_PATH}/${parsed.data.quoteId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function markRetailerQuoteMessagesAsRead(
  quoteId: string,
): Promise<ActionResult> {
  try {
    const parsed = quoteIdSchema.safeParse(quoteId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("quote_messages")
      .update({ is_read: true })
      .eq("quote_id", parsed.data)
      .neq("sender_user_id", user.id);

    if (error) return { success: false, error: error.message };

    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function acceptQuote(
  quoteId: string,
): Promise<ActionResult<{ order_id: string }>> {
  try {
    const parsed = quoteIdSchema.safeParse(quoteId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: orderId, error } = await supabase.rpc("accept_quote", {
      p_quote_id: parsed.data,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath(QUOTES_PATH);
    revalidatePath("/lojista/pedidos");
    return { success: true, data: { order_id: orderId } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function rejectRetailerQuote(
  quoteId: string,
  reason?: string,
): Promise<ActionResult> {
  try {
    const parsed = rejectQuoteSchema.safeParse({ quoteId, reason });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: quote, error: fetchError } = await supabase
      .from("quotes")
      .select("status")
      .eq("id", parsed.data.quoteId)
      .eq("retailer_id", tenantId)
      .single();

    if (fetchError || !quote) {
      return { success: false, error: "Cotação não encontrada" };
    }

    if (quote.status !== "sent") {
      return {
        success: false,
        error: "Apenas cotações enviadas podem ser recusadas",
      };
    }

    const { error: updateError } = await supabase
      .from("quotes")
      .update({ status: "rejected" })
      .eq("id", parsed.data.quoteId)
      .eq("retailer_id", tenantId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(QUOTES_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function requestQuoteRevision(
  quoteId: string,
  message: string,
): Promise<ActionResult> {
  try {
    const parsed = requestRevisionSchema.safeParse({ quoteId, message });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: quote, error: fetchError } = await supabase
      .from("quotes")
      .select("status")
      .eq("id", parsed.data.quoteId)
      .eq("retailer_id", tenantId)
      .single();

    if (fetchError || !quote) {
      return { success: false, error: "Cotação não encontrada" };
    }

    if (quote.status !== "sent") {
      return {
        success: false,
        error: "Apenas cotações enviadas podem receber solicitação de revisão",
      };
    }

    const { error: msgError } = await supabase.from("quote_messages").insert({
      quote_id: parsed.data.quoteId,
      sender_user_id: user.id,
      body: parsed.data.message,
    });

    if (msgError) return { success: false, error: msgError.message };

    revalidatePath(QUOTES_PATH);
    revalidatePath(`${QUOTES_PATH}/${parsed.data.quoteId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
