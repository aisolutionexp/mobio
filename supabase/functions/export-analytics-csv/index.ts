import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const exportSchema = z.object({
  type: z.enum([
    "orders",
    "statements",
    "analytics_factory",
    "analytics_retailer",
  ]),
  tenant_id: z.string().uuid(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
});

function escapeCsvField(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const keys = headers;
  const headerLine = keys.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) =>
    keys.map((k) => escapeCsvField(row[k])).join(","),
  );
  return [headerLine, ...dataLines].join("\r\n");
}

Deno.serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "method_not_allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: "unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    const parsed = exportSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { type, tenant_id, start_date, end_date } = parsed.data;
    const supabase = createAdminClient();

    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const isFactory =
      type === "orders" ||
      type === "statements" ||
      type === "analytics_factory";
    const memberColumn = isFactory ? "factory_id" : "retailer_id";

    const { data: memberCheck } = await supabase
      .from("team_members")
      .select("id")
      .eq("user_id", user.id)
      .eq(memberColumn, tenant_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!memberCheck) {
      return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let csvContent: string;

    if (type === "orders") {
      let query = supabase
        .from("orders")
        .select("order_number, status, total_cents, created_at, retailer_id")
        .eq(isFactory ? "factory_id" : "retailer_id", tenant_id)
        .order("created_at", { ascending: false });

      if (start_date) query = query.gte("created_at", `${start_date}T00:00:00`);
      if (end_date) query = query.lte("created_at", `${end_date}T23:59:59.999`);

      const { data, error } = await query;
      if (error) throw error;

      csvContent = toCsv(
        ["order_number", "status", "total_cents", "created_at"],
        (data ?? []).map((r) => ({
          order_number: r.order_number ?? "",
          status: r.status,
          total_cents: r.total_cents,
          created_at: r.created_at,
        })),
      );
    } else if (type === "statements") {
      let query = supabase
        .from("statements")
        .select(
          "period_start, gmv_cents, fee_cents, net_cents, status, orders_count",
        )
        .eq("factory_id", tenant_id)
        .order("period_start", { ascending: false });

      if (start_date) query = query.gte("period_start", start_date);
      if (end_date) query = query.lte("period_start", end_date);

      const { data, error } = await query;
      if (error) throw error;

      csvContent = toCsv(
        [
          "period_start",
          "gmv_cents",
          "fee_cents",
          "net_cents",
          "orders_count",
          "status",
        ],
        (data ?? []).map((r) => ({
          period_start: r.period_start,
          gmv_cents: r.gmv_cents,
          fee_cents: r.fee_cents,
          net_cents: r.net_cents,
          orders_count: r.orders_count,
          status: r.status,
        })),
      );
    } else if (type === "analytics_factory") {
      const p_start =
        start_date ??
        new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const p_end = end_date ?? new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase.rpc("get_factory_analytics", {
        p_factory_id: tenant_id,
        p_start,
        p_end,
      });
      if (error) throw error;

      const row = data?.[0];
      if (!row) {
        csvContent =
          "gmv_cents,orders_count,avg_ticket_cents,active_retailers\r\n0,0,0,0";
      } else {
        csvContent = toCsv(
          ["gmv_cents", "orders_count", "avg_ticket_cents", "active_retailers"],
          [
            {
              gmv_cents: row.gmv_cents,
              orders_count: row.orders_count,
              avg_ticket_cents: row.avg_ticket_cents,
              active_retailers: row.active_retailers,
            },
          ],
        );
      }
    } else {
      const p_start =
        start_date ??
        new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const p_end = end_date ?? new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase.rpc("get_retailer_analytics", {
        p_retailer_id: tenant_id,
        p_start,
        p_end,
      });
      if (error) throw error;

      const row = data?.[0];
      if (!row) {
        csvContent = "total_spent_cents,orders_count,avg_ticket_cents\r\n0,0,0";
      } else {
        csvContent = toCsv(
          ["total_spent_cents", "orders_count", "avg_ticket_cents"],
          [
            {
              total_spent_cents: row.total_spent_cents,
              orders_count: row.orders_count,
              avg_ticket_cents: row.avg_ticket_cents,
            },
          ],
        );
      }
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `export-${type}-${dateStr}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("export-analytics-csv error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
