"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import type { ActionResult } from "@/types/actions";

const PLAN_PATH = "/atelier/conta/plano";

export interface PlanData {
  id: string;
  name: string;
  slug: string;
  type: string;
  price_cents: number;
  currency: string;
  features: Record<string, boolean | number | null>;
  is_active: boolean;
}

export interface SubscriptionData {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  plan: PlanData;
}

export async function getCurrentSubscription(): Promise<
  ActionResult<SubscriptionData | null>
> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("tenant_id", tenantId)
      .eq("tenant_type", "atelier")
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

export async function listAvailablePlans(): Promise<ActionResult<PlanData[]>> {
  try {
    await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("plans")
      .select(
        "id, name, slug, type, price_cents, currency, features, is_active",
      )
      .eq("type", "atelier")
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

// TODO: Integrar billing real (Stripe/Asaas) em sprint futura.
// MVP: troca de plano apenas atualiza registro no banco.
export async function changePlan(planId: string): Promise<ActionResult> {
  if (!planId) {
    return { success: false, error: "Plano inválido" };
  }

  try {
    const { tenantId, role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode alterar o plano",
      };
    }

    const supabase = await createClient();

    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("id", planId)
      .eq("type", "atelier")
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
      .eq("tenant_type", "atelier")
      .in("status", ["active", "trialing"])
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          status: "active",
        })
        .eq("id", existing.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("subscriptions").insert({
        tenant_id: tenantId,
        tenant_type: "atelier",
        plan_id: planId,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        status: "active",
      });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath(PLAN_PATH);
    revalidatePath("/atelier/conta");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
