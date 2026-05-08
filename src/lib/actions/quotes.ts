"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { z } from "zod";
import { createQuoteSchema } from "@/lib/validators/quotes";
import { sendQuoteMessageSchema } from "@/lib/validators/quotes-retailer";
import type { ActionResult } from "@/types/actions";

const RETAILERS_PATH = "/atelier/lojistas";

export async function listFactoryQuotes(filters?: {
  status?: string;
  page?: number;
}) {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const page = filters?.page ?? 0;
  const pageSize = 50;

  let query = supabase
    .from("quotes")
    .select(
      "id, status, total_cents, currency, valid_until, created_at, retailer_id, retailers(id, name)",
    )
    .eq("factory_id", tenantId)
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function listQuotesForRetailer(retailerId: string) {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, status, total_cents, currency, valid_until, created_at, quote_items(id, product_id, quantity, unit_price_cents, products(id, name))",
    )
    .eq("factory_id", tenantId)
    .eq("retailer_id", retailerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function listFactoryProducts() {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, reference, wholesale_price, retail_price")
    .eq("factory_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createQuote(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const rawItems = formData.get("items");
    let items: unknown[] = [];
    if (typeof rawItems === "string") {
      try {
        items = JSON.parse(rawItems);
      } catch {
        return { success: false, error: "Itens em formato inválido" };
      }
    }

    const parsed = createQuoteSchema.safeParse({
      retailer_id: formData.get("retailer_id"),
      valid_until: formData.get("valid_until"),
      items,
      notes: formData.get("notes") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId, role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode criar cotações",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: authCheck } = await supabase
      .from("authorized_retailers")
      .select("factory_id")
      .eq("factory_id", tenantId)
      .eq("retailer_id", parsed.data.retailer_id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!authCheck) {
      return {
        success: false,
        error: "Lojista não autorizado para esta fábrica",
      };
    }

    const totalCents = parsed.data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_cents,
      0,
    );

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        factory_id: tenantId,
        retailer_id: parsed.data.retailer_id,
        created_by: user.id,
        valid_until: parsed.data.valid_until,
        notes: parsed.data.notes ?? null,
        status: "draft",
        total_cents: totalCents,
      })
      .select("id")
      .single();

    if (quoteError) return { success: false, error: quoteError.message };

    const quoteItems = parsed.data.items.map((item) => ({
      quote_id: quote.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
    }));

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItems);

    if (itemsError) return { success: false, error: itemsError.message };

    revalidatePath(`${RETAILERS_PATH}/${parsed.data.retailer_id}`);
    return { success: true, data: { id: quote.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function sendQuote(quoteId: string): Promise<ActionResult> {
  try {
    const { tenantId, role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode enviar cotações",
      };
    }

    const supabase = await createClient();

    const { data: quote, error: fetchError } = await supabase
      .from("quotes")
      .select("status, retailer_id")
      .eq("id", quoteId)
      .eq("factory_id", tenantId)
      .single();

    if (fetchError || !quote) {
      return { success: false, error: "Cotação não encontrada" };
    }

    if (quote.status !== "draft") {
      return { success: false, error: "Apenas rascunhos podem ser enviados" };
    }

    const { error: updateError } = await supabase
      .from("quotes")
      .update({ status: "sent" })
      .eq("id", quoteId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`${RETAILERS_PATH}/${quote.retailer_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function listQuoteMessages(quoteId: string) {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id")
    .eq("id", quoteId)
    .eq("factory_id", tenantId)
    .single();

  if (quoteError || !quote) throw new Error("Cotação não encontrada");

  const { data, error } = await supabase
    .from("quote_messages")
    .select(
      "id, body, is_read, created_at, sender_user_id, profiles(id, full_name, avatar_path)",
    )
    .eq("quote_id", quoteId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function sendQuoteMessage(
  quoteId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const parsed = sendQuoteMessageSchema.safeParse({ quoteId, body });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id")
      .eq("id", parsed.data.quoteId)
      .eq("factory_id", tenantId)
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

    revalidatePath(`${RETAILERS_PATH}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function markQuoteMessagesAsRead(
  quoteId: string,
): Promise<ActionResult> {
  try {
    const parsed = z.string().uuid("Cotação inválida").safeParse(quoteId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("quote_messages")
      .update({ is_read: true })
      .eq("quote_id", quoteId)
      .neq("sender_user_id", user.id);

    if (error) return { success: false, error: error.message };

    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function rejectQuote(quoteId: string): Promise<ActionResult> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data: quote, error: fetchError } = await supabase
      .from("quotes")
      .select("status, retailer_id")
      .eq("id", quoteId)
      .eq("factory_id", tenantId)
      .single();

    if (fetchError || !quote) {
      return { success: false, error: "Cotação não encontrada" };
    }

    if (quote.status !== "sent" && quote.status !== "draft") {
      return { success: false, error: "Cotação não pode ser rejeitada" };
    }

    const { error: updateError } = await supabase
      .from("quotes")
      .update({ status: "rejected" })
      .eq("id", quoteId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`${RETAILERS_PATH}/${quote.retailer_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
