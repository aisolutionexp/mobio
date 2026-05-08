"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import {
  orderIdSchema,
  createPaymentScheduleSchema,
  recordPaymentSchema,
  markScheduleStatusSchema,
} from "@/lib/validators/payments";
import type { ActionResult } from "@/types/actions";

export async function getPaymentScheduleForOrder(orderId: string) {
  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("payment_schedules")
    .select(
      "id, order_id, total_cents, signal_pct, due_date, status, created_at, updated_at, payment_records(id, amount_cents, paid_at, payment_method, transaction_ref, created_at)",
    )
    .eq("order_id", parsed.data)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createPaymentSchedule(
  orderId: string,
  signalPct: number,
  dueDate?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createPaymentScheduleSchema.safeParse({
      orderId,
      signalPct,
      dueDate,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId, role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode criar agendas de pagamento",
      };
    }

    const supabase = await createClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total_cents")
      .eq("id", parsed.data.orderId)
      .eq("factory_id", tenantId)
      .single();

    if (orderError || !order) {
      return { success: false, error: "Pedido não encontrado" };
    }

    const { data: existing } = await supabase
      .from("payment_schedules")
      .select("id")
      .eq("order_id", parsed.data.orderId)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: "Já existe uma agenda de pagamento para este pedido",
      };
    }

    const { data: schedule, error: insertError } = await supabase
      .from("payment_schedules")
      .insert({
        order_id: parsed.data.orderId,
        total_cents: order.total_cents,
        signal_pct: parsed.data.signalPct,
        due_date: parsed.data.dueDate ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) return { success: false, error: insertError.message };

    revalidatePath(`/atelier/pedidos/${parsed.data.orderId}`);
    return { success: true, data: { id: schedule.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function recordPayment(
  scheduleId: string,
  amountCents: number,
  paymentMethod: string,
  transactionRef?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = recordPaymentSchema.safeParse({
      scheduleId,
      amountCents,
      paymentMethod,
      transactionRef,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const { data: schedule, error: scheduleError } = await supabase
      .from("payment_schedules")
      .select("id, order_id, status")
      .eq("id", parsed.data.scheduleId)
      .single();

    if (scheduleError || !schedule) {
      return { success: false, error: "Agenda de pagamento não encontrada" };
    }

    if (schedule.status === "cancelled") {
      return { success: false, error: "Agenda de pagamento cancelada" };
    }

    const { data: record, error: insertError } = await supabase
      .from("payment_records")
      .insert({
        schedule_id: parsed.data.scheduleId,
        amount_cents: parsed.data.amountCents,
        payment_method: parsed.data.paymentMethod,
        transaction_ref: parsed.data.transactionRef ?? null,
      })
      .select("id")
      .single();

    if (insertError) return { success: false, error: insertError.message };

    revalidatePath(`/atelier/pedidos/${schedule.order_id}`);
    revalidatePath(`/lojista/pedidos/${schedule.order_id}`);
    return { success: true, data: { id: record.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function markScheduleStatus(
  scheduleId: string,
  status: "pending" | "paid" | "late" | "cancelled",
): Promise<ActionResult> {
  try {
    const parsed = markScheduleStatusSchema.safeParse({ scheduleId, status });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const { data: schedule, error: fetchError } = await supabase
      .from("payment_schedules")
      .select("id, order_id")
      .eq("id", parsed.data.scheduleId)
      .single();

    if (fetchError || !schedule) {
      return { success: false, error: "Agenda de pagamento não encontrada" };
    }

    const { error: updateError } = await supabase
      .from("payment_schedules")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.scheduleId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`/atelier/pedidos/${schedule.order_id}`);
    revalidatePath(`/lojista/pedidos/${schedule.order_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
