"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import { orderIdSchema } from "@/lib/validators/orders-retailer";
import type { ActionResult } from "@/types/actions";

const ORDERS_PATH = "/lojista/pedidos";

export async function listRetailerOrders(filters?: {
  status?: string;
  factory_id?: string;
  page?: number;
}) {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const page = filters?.page ?? 0;
  const pageSize = 50;

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, status, total_cents, currency, created_at, factory_id, factories(id, name, slug, logo_path, region_id, regions(name))",
    )
    .eq("retailer_id", tenantId)
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

export async function getRetailerOrder(orderId: string) {
  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, factories(id, name, slug, logo_path, email, region_id, regions(name)), order_items(id, product_id, quantity, unit_price_cents, products(id, name, reference)), order_status_history(id, from_status, to_status, notes, created_at), payment_schedules(id, total_cents, signal_pct, due_date, status, created_at)",
    )
    .eq("id", parsed.data)
    .eq("retailer_id", tenantId)
    .single();

  if (error) throw new Error(error.message);
  return order;
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  try {
    const parsed = orderIdSchema.safeParse(orderId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", parsed.data)
      .eq("retailer_id", tenantId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: "Pedido não encontrado" };
    }

    const { data, error } = await supabase.functions.invoke("cancel-order", {
      body: { order_id: parsed.data },
    });

    if (error) return { success: false, error: error.message };

    const result = data as { ok: boolean; error?: string };
    if (!result.ok) {
      return {
        success: false,
        error: result.error ?? "Não foi possível cancelar o pedido",
      };
    }

    revalidatePath(ORDERS_PATH);
    revalidatePath(`${ORDERS_PATH}/${parsed.data}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
