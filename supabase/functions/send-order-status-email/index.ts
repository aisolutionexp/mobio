import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

// Keep in sync with src/lib/constants/order-status.ts
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Em produção",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const payloadSchema = z.object({
  order_id: z.string().uuid(),
  new_status: z.string().min(1),
});

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
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { order_id, new_status } = parsed.data;
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

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, factory_id, retailer_id, factories(id, name), retailers(id, name)",
      )
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ ok: false, error: "order_not_found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const statusLabel = STATUS_LABELS[new_status] ?? new_status;
    const orderLabel = order.order_number ?? order_id.slice(0, 8);

    const factory = order.factories as unknown as {
      id: string;
      name: string;
    } | null;
    const retailer = order.retailers as unknown as {
      id: string;
      name: string;
    } | null;

    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      body: string;
      link: string;
    }> = [];

    const { data: retailerMembers } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("retailer_id", order.retailer_id)
      .in("role", ["lojista_owner", "lojista_buyer"])
      .eq("is_active", true);

    if (retailerMembers) {
      for (const member of retailerMembers) {
        notifications.push({
          user_id: member.user_id,
          type: "order_status_changed",
          title: `Pedido ${orderLabel}: ${statusLabel}`,
          body: `O pedido de ${factory?.name ?? "fábrica"} mudou para "${statusLabel}".`,
          link: `/lojista/pedidos/${order_id}`,
        });
      }
    }

    const { data: factoryMembers } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("factory_id", order.factory_id)
      .in("role", ["atelier_owner", "atelier_member"])
      .eq("is_active", true);

    if (factoryMembers) {
      for (const member of factoryMembers) {
        notifications.push({
          user_id: member.user_id,
          type: "order_status_changed",
          title: `Pedido ${orderLabel}: ${statusLabel}`,
          body: `O pedido de ${retailer?.name ?? "lojista"} mudou para "${statusLabel}".`,
          link: `/atelier/pedidos/${order_id}`,
        });
      }
    }

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error inserting notifications:", notifError);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-order-status-email unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
