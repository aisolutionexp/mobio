"use server";

import { createClient } from "@/lib/supabase/server";
import {
  requireFactoryAccess,
  requireRetailerAccess,
} from "@/lib/services/active-tenant";

export interface CsvExportPayload {
  endpoint: string;
  body: Record<string, string>;
  token: string;
}

async function getToken(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  // getSession needed for raw access_token to call Edge Function
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}

function endpoint(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL!}/functions/v1/export-analytics-csv`;
}

export async function getExportOrdersCsvPayload(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<CsvExportPayload> {
  const { tenantId } = await requireFactoryAccess();
  const body: Record<string, string> = { type: "orders", tenant_id: tenantId };
  if (filters?.startDate) body.start_date = filters.startDate;
  if (filters?.endDate) body.end_date = filters.endDate;
  return { endpoint: endpoint(), body, token: await getToken() };
}

export async function getExportRetailerOrdersCsvPayload(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<CsvExportPayload> {
  const { tenantId } = await requireRetailerAccess();
  const body: Record<string, string> = { type: "orders", tenant_id: tenantId };
  if (filters?.startDate) body.start_date = filters.startDate;
  if (filters?.endDate) body.end_date = filters.endDate;
  return { endpoint: endpoint(), body, token: await getToken() };
}

export async function getExportStatementsCsvPayload(): Promise<CsvExportPayload> {
  const { tenantId } = await requireFactoryAccess();
  return {
    endpoint: endpoint(),
    body: { type: "statements", tenant_id: tenantId },
    token: await getToken(),
  };
}

export async function getExportAnalyticsCsvPayload(
  type: "analytics_factory" | "analytics_retailer",
  period?: { startDate?: string; endDate?: string },
): Promise<CsvExportPayload> {
  const isFactory = type === "analytics_factory";
  const { tenantId } = isFactory
    ? await requireFactoryAccess()
    : await requireRetailerAccess();

  const body: Record<string, string> = { type, tenant_id: tenantId };
  if (period?.startDate) body.start_date = period.startDate;
  if (period?.endDate) body.end_date = period.endDate;

  return { endpoint: endpoint(), body, token: await getToken() };
}
