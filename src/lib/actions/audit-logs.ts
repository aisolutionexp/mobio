"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/services/admin";
import {
  auditLogFiltersSchema,
  auditLogIdSchema,
} from "@/lib/validators/audit-logs";
import type { ActionResult } from "@/types/actions";
import type { Json } from "@/types/database";

export interface AuditLogRow {
  id: string;
  table_name: string;
  operation: string;
  record_id: string;
  actor_user_id: string | null;
  created_at: string;
}

export interface AuditLogDetail extends AuditLogRow {
  before_data: Json | null;
  after_data: Json | null;
  actor_email?: string;
}

export interface AuditLogListResult {
  logs: AuditLogRow[];
  total: number;
}

export async function listAuditLogs(filters?: {
  table?: string;
  actor_user_id?: string;
  page?: number;
}): Promise<ActionResult<AuditLogListResult>> {
  try {
    await requireAdmin();

    const parsed = auditLogFiltersSchema.safeParse(filters ?? {});
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { table, actor_user_id, page, per_page } = parsed.data;
    const supabase = await createClient();

    let query = supabase
      .from("audit_logs")
      .select(
        "id, table_name, operation, record_id, actor_user_id, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * per_page, page * per_page - 1);

    if (table) query = query.eq("table_name", table);
    if (actor_user_id) query = query.eq("actor_user_id", actor_user_id);

    const { data, error, count } = await query;

    if (error) return { success: false, error: error.message };

    return { success: true, data: { logs: data ?? [], total: count ?? 0 } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function getAuditLogDetail(
  logId: string,
): Promise<ActionResult<AuditLogDetail>> {
  try {
    await requireAdmin();

    const parsed = auditLogIdSchema.safeParse(logId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        "id, table_name, operation, record_id, actor_user_id, before_data, after_data, created_at",
      )
      .eq("id", parsed.data)
      .single();

    if (error) return { success: false, error: error.message };

    let actorEmail: string | undefined;
    if (data.actor_user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.actor_user_id)
        .maybeSingle();
      actorEmail = profile?.full_name ?? undefined;
    }

    return {
      success: true,
      data: { ...data, actor_email: actorEmail },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
