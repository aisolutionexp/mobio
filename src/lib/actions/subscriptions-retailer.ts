"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import { changePlanSchema } from "@/lib/validators/subscriptions-retailer";
import type { ActionResult } from "@/types/actions";
import type { PlanData, SubscriptionData } from "@/lib/actions/subscriptions";

const PLAN_PATH = "/lojista/conta/plano";

export async function getRetailerCurrentSubscription(): Promise<
  ActionResult<SubscriptionData | null>
> {
  try {
    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("tenant_id", tenantId)
      .eq("tenant_type", "lojista")
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, error: error.message };

    if (!data || !data.plan) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: data.id,
        plan_id: data.plan_id,
        status: data.status,
        current_period_start: data.current_period_start,
        current_period_end: data.current_period_end,
        cancelled_at: data.cancelled_at,
        plan: data.plan as unknown as PlanData,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function listRetailerPlans(): Promise<ActionResult<PlanData[]>> {
  try {
    await requireRetailerAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("plans")
      .select(
        "id, name, slug, type, price_cents, currency, features, is_active",
      )
      .eq("type", "lojista")
      .eq("is_active", true)
      .order("price_cents", { ascending: true });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: (data ?? []) as unknown as PlanData[],
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function changeRetailerPlan(
  planId: string,
): Promise<ActionResult> {
  const parsed = changePlanSchema.safeParse({ planId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId, role } = await requireRetailerAccess();

    if (role !== "lojista_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode alterar o plano",
      };
    }

    const supabase = await createClient();

    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("id", parsed.data.planId)
      .eq("type", "lojista")
      .eq("is_active", true)
      .single();

    if (!plan) {
      return { success: false, error: "Plano não encontrado ou indisponível" };
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("tenant_type", "lojista")
      .in("status", ["active", "trialing"])
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan_id: parsed.data.planId,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          status: "active",
        })
        .eq("id", existing.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("subscriptions").insert({
        tenant_id: tenantId,
        tenant_type: "lojista",
        plan_id: parsed.data.planId,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        status: "active",
      });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath(PLAN_PATH);
    revalidatePath("/lojista/conta");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
