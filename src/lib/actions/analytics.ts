"use server";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import { requireAdmin } from "@/lib/services/admin";
import { periodSchema, periodToDates } from "@/lib/validators/analytics";

export interface TopItem {
  name: string;
  quantity: number;
  gmv_cents: number;
}

export interface FactoryAnalytics {
  gmv_cents: number;
  orders_count: number;
  avg_ticket_cents: number;
  active_retailers: number;
  top_products: TopItem[];
  top_retailers: TopItem[];
}

export async function getFactoryAnalytics(
  period?: string,
): Promise<FactoryAnalytics> {
  const { tenantId } = await requireFactoryAccess();
  const parsed = periodSchema.safeParse(period);
  const { startDate, endDate } = periodToDates(
    parsed.success ? parsed.data : "30d",
  );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_factory_analytics", {
    p_factory_id: tenantId,
    p_start: startDate,
    p_end: endDate,
  });

  if (error) throw new Error(error.message);

  const row = data?.[0];
  if (!row) {
    return {
      gmv_cents: 0,
      orders_count: 0,
      avg_ticket_cents: 0,
      active_retailers: 0,
      top_products: [],
      top_retailers: [],
    };
  }

  return {
    gmv_cents: row.gmv_cents,
    orders_count: row.orders_count,
    avg_ticket_cents: row.avg_ticket_cents,
    active_retailers: row.active_retailers,
    top_products: (row.top_products as unknown as TopItem[]) ?? [],
    top_retailers: (row.top_retailers as unknown as TopItem[]) ?? [],
  };
}

export interface RetailerAnalytics {
  total_spent_cents: number;
  orders_count: number;
  avg_ticket_cents: number;
  top_factories: TopItem[];
  top_categories: TopItem[];
}

export async function getRetailerAnalytics(
  period?: string,
): Promise<RetailerAnalytics> {
  const { tenantId } = await requireRetailerAccess();
  const parsed = periodSchema.safeParse(period);
  const { startDate, endDate } = periodToDates(
    parsed.success ? parsed.data : "30d",
  );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_retailer_analytics", {
    p_retailer_id: tenantId,
    p_start: startDate,
    p_end: endDate,
  });

  if (error) throw new Error(error.message);

  const row = data?.[0];
  if (!row) {
    return {
      total_spent_cents: 0,
      orders_count: 0,
      avg_ticket_cents: 0,
      top_factories: [],
      top_categories: [],
    };
  }

  return {
    total_spent_cents: row.total_spent_cents,
    orders_count: row.orders_count,
    avg_ticket_cents: row.avg_ticket_cents,
    top_factories: (row.top_factories as unknown as TopItem[]) ?? [],
    top_categories: (row.top_categories as unknown as TopItem[]) ?? [],
  };
}

export interface AdminOverview {
  total_factories: number;
  total_retailers: number;
  total_orders: number;
  total_gmv_cents: number;
  signups_last_30d: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_overview");

  if (error) throw new Error(error.message);

  const row = data?.[0];
  if (!row) {
    return {
      total_factories: 0,
      total_retailers: 0,
      total_orders: 0,
      total_gmv_cents: 0,
      signups_last_30d: 0,
    };
  }

  return {
    total_factories: row.total_factories,
    total_retailers: row.total_retailers,
    total_orders: row.total_orders,
    total_gmv_cents: row.total_gmv_cents,
    signups_last_30d: row.signups_last_30d,
  };
}

export interface RecentAuditLog {
  id: string;
  table_name: string;
  operation: string;
  record_id: string;
  created_at: string;
}

export async function getRecentAuditLogs(
  limit = 10,
): Promise<RecentAuditLog[]> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, table_name, operation, record_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
