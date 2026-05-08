import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const requestSchema = z.object({
  invitation_id: z.string().uuid("ID de convite inválido"),
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
        JSON.stringify({ ok: false, error: "Não autorizado" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createAdminClient();
    const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

    const { data: invitation, error: invError } = await supabase
      .from("factory_invitations")
      .select(
        "id, factory_id, retailer_email, retailer_name, token, status, expires_at, invited_by",
      )
      .eq("id", parsed.data.invitation_id)
      .single();

    if (invError || !invitation) {
      return new Response(
        JSON.stringify({ ok: false, error: "Convite não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (invitation.status !== "pending") {
      return new Response(
        JSON.stringify({ ok: false, error: "Convite não está pendente" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: factory } = await supabase
      .from("factories")
      .select("name")
      .eq("id", invitation.factory_id)
      .single();

    const { data: inviter } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", invitation.invited_by)
      .single();

    const invitationUrl = `${SITE_URL}/aceitar-convite-fabrica/${invitation.token}`;

    return new Response(
      JSON.stringify({
        ok: true,
        invitation_url: invitationUrl,
        factory_name: factory?.name ?? null,
        invited_by_name: inviter?.full_name ?? null,
        retailer_email: invitation.retailer_email,
        expires_at: invitation.expires_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("send-factory-invitation unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
