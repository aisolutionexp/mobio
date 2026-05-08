"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import type { ActionResult } from "@/types/actions";

const orderIdSchema = z.string().uuid("Pedido inválido");

const ORDERS_PATH = "/atelier/pedidos";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function listFactoryOrders(filters?: {
  status?: string;
  retailer_id?: string;
  page?: number;
}) {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const page = filters?.page ?? 0;
  const pageSize = 50;

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, status, total_cents, currency, created_at, retailer_id, retailers(id, name, slug, logo_path)",
    )
    .eq("factory_id", tenantId)
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.retailer_id) {
    query = query.eq("retailer_id", filters.retailer_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getFactoryOrder(orderId: string) {
  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, retailers(id, name, slug, logo_path, email), order_items(id, product_id, quantity, unit_price_cents, products(id, name, reference)), order_status_history(id, from_status, to_status, changed_by, notes, created_at)",
    )
    .eq("id", orderId)
    .eq("factory_id", tenantId)
    .single();

  if (error) throw new Error(error.message);
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<ActionResult> {
  try {
    const parsed = orderIdSchema.safeParse(orderId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId, role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode alterar o status do pedido",
      };
    }

    const supabase = await createClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .eq("factory_id", tenantId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: "Pedido não encontrado" };
    }

    const currentStatus = order.status as OrderStatus;
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed?.includes(newStatus)) {
      return {
        success: false,
        error: `Não é possível mudar de "${currentStatus}" para "${newStatus}"`,
      };
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .eq("factory_id", tenantId);

    if (updateError) return { success: false, error: updateError.message };

    supabase.functions
      .invoke("send-order-status-email", {
        body: { order_id: orderId, new_status: newStatus },
      })
      .catch(() => {});

    revalidatePath(ORDERS_PATH);
    revalidatePath(`${ORDERS_PATH}/${orderId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
