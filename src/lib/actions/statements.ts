"use server";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { requireAdmin } from "@/lib/services/admin";
import {
  statementIdSchema,
  generateStatementsSchema,
} from "@/lib/validators/statements";
import type { ActionResult } from "@/types/actions";

export interface StatementRow {
  id: string;
  factory_id: string;
  period_start: string;
  period_end: string;
  gmv_cents: number;
  orders_count: number;
  fee_cents: number;
  net_cents: number;
  status: string;
  created_at: string;
}

export interface StatementOrderRow {
  id: string;
  order_number: string | null;
  total_cents: number;
  status: string;
  retailer_id: string;
  created_at: string;
  updated_at: string;
}

export interface StatementDetail extends StatementRow {
  orders: StatementOrderRow[];
}

export async function listFactoryStatements(): Promise<
  ActionResult<StatementRow[]>
> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("statements")
      .select(
        "id, factory_id, period_start, period_end, gmv_cents, orders_count, fee_cents, net_cents, status, created_at",
      )
      .eq("factory_id", tenantId)
      .order("period_start", { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, data: data ?? [] };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function getStatement(
  statementId: string,
): Promise<ActionResult<StatementDetail>> {
  const parsed = statementIdSchema.safeParse(statementId);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data: statement, error } = await supabase
      .from("statements")
      .select(
        "id, factory_id, period_start, period_end, gmv_cents, orders_count, fee_cents, net_cents, status, created_at",
      )
      .eq("id", parsed.data)
      .eq("factory_id", tenantId)
      .single();

    if (error) return { success: false, error: error.message };

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, order_number, total_cents, status, retailer_id, created_at, updated_at",
      )
      .eq("factory_id", tenantId)
      .eq("status", "delivered")
      .gte("updated_at", `${statement.period_start}T00:00:00`)
      .lt("updated_at", `${statement.period_end}T23:59:59.999`)
      .order("updated_at", { ascending: false });

    if (ordersError) return { success: false, error: ordersError.message };

    return {
      success: true,
      data: { ...statement, orders: orders ?? [] },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function generateMonthlyStatements(
  periodStart: string,
): Promise<ActionResult<{ count: number }>> {
  const parsed = generateStatementsSchema.safeParse({ periodStart });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "fn_generate_monthly_statements",
      { p_period_start: parsed.data.periodStart },
    );

    if (error) return { success: false, error: error.message };

    return { success: true, data: { count: data ?? 0 } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
