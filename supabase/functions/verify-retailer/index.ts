import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const verifyRetailerSchema = z.object({
  retailer_id: z.string().uuid(),
  decision: z.enum(["verified", "rejected"]),
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
    const parsed = verifyRetailerSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { retailer_id, decision } = parsed.data;
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

    const { data: adminMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .eq("is_active", true)
      .maybeSingle();

    if (!adminMember) {
      return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .select("id, name, created_by")
      .eq("id", retailer_id)
      .single();

    if (retailerError || !retailer) {
      return new Response(
        JSON.stringify({ ok: false, error: "retailer_not_found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const title =
      decision === "verified"
        ? `Loja "${retailer.name}" verificada`
        : `Verificação da loja "${retailer.name}" recusada`;

    const notificationBody =
      decision === "verified"
        ? "Parabéns! Sua loja foi verificada e agora tem acesso completo à plataforma."
        : "Sua solicitação de verificação foi recusada. Verifique os dados e tente novamente.";

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: retailer.created_by,
      type: decision === "verified" ? "retailer_verified" : "retailer_rejected",
      title,
      body: notificationBody,
      link: "/lojista/conta",
    });

    if (notifError) {
      console.error("Error inserting notification:", notifError);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-retailer unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
