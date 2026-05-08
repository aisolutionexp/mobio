import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const cancelOrderSchema = z.object({
  order_id: z.string().uuid(),
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
    const parsed = cancelOrderSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { order_id } = parsed.data;
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
      .select("id, retailer_id, status")
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

    const { data: memberCheck } = await supabase
      .from("team_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("retailer_id", order.retailer_id)
      .in("role", ["lojista_owner", "lojista_buyer"])
      .eq("is_active", true)
      .maybeSingle();

    if (!memberCheck) {
      return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status === "cancelled") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: canCancel, error: rpcError } = await supabase.rpc(
      "fn_can_cancel_order",
      { p_order_id: order_id },
    );

    if (rpcError) {
      console.error("fn_can_cancel_order error:", rpcError);
      return new Response(
        JSON.stringify({ ok: false, error: "internal_error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!canCancel) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "cancel_not_allowed",
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order_id);

    if (updateError) {
      console.error("cancel order update error:", updateError);
      return new Response(
        JSON.stringify({ ok: false, error: "internal_error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("cancel-order unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
