import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const acceptSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  email: z.string().email("Email inválido"),
});

async function getUserIdByEmail(email: string): Promise<string | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;

  const resp = await fetch(
    `${url}/auth/v1/admin/users?page=1&per_page=1&filter=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${key}`, apikey: key } },
  );

  if (!resp.ok) return null;

  const data = await resp.json();
  const user = data?.users?.find(
    (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  return user?.id ?? null;
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
    const body = await req.json();
    const parsed = acceptSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Convite inválido ou expirado",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { token, email } = parsed.data;
    const supabase = createAdminClient();
    const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

    const { data: invitation, error: invError } = await supabase
      .from("factory_invitations")
      .select("id, factory_id, retailer_email, status, expires_at, invited_by")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (invError || !invitation) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Convite inválido ou expirado",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from("factory_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({
          ok: false,
          error: "Convite inválido ou expirado",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let userId: string;

    const { data: authUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: email.split("@")[0] },
      });

    if (createError) {
      if (
        createError.message?.includes("already been registered") ||
        createError.message?.includes("User already registered")
      ) {
        const foundId = await getUserIdByEmail(email);
        if (!foundId) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Convite inválido ou expirado",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        userId = foundId;
      } else {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Convite inválido ou expirado",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      userId = authUser.user.id;

      await supabase.from("profiles").insert({
        id: userId,
        full_name: email.split("@")[0],
      });
    }

    // Find or create retailer for this user
    let retailerId: string | null = null;

    const { data: existingTeamMember } = await supabase
      .from("team_members")
      .select("retailer_id")
      .eq("user_id", userId)
      .not("retailer_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (existingTeamMember?.retailer_id) {
      retailerId = existingTeamMember.retailer_id;
    } else {
      const slug = `retailer-${Date.now()}`;
      const { data: newRetailer, error: retailerError } = await supabase
        .from("retailers")
        .insert({
          name: email.split("@")[0],
          slug,
          email,
          created_by: userId,
        })
        .select("id")
        .single();

      if (retailerError) {
        console.error("Error creating retailer:", retailerError);
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Convite inválido ou expirado",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      retailerId = newRetailer.id;

      await supabase.from("team_members").insert({
        user_id: userId,
        retailer_id: retailerId,
        role: "lojista_owner",
      });
    }

    // Check idempotency
    const { data: existingAuth } = await supabase
      .from("authorized_retailers")
      .select("factory_id, status")
      .eq("factory_id", invitation.factory_id)
      .eq("retailer_id", retailerId)
      .maybeSingle();

    if (existingAuth) {
      if (existingAuth.status !== "active") {
        await supabase
          .from("authorized_retailers")
          .update({
            status: "active",
            authorized_by: invitation.invited_by,
            revoked_at: null,
          })
          .eq("factory_id", invitation.factory_id)
          .eq("retailer_id", retailerId);
      }
    } else {
      const { error: authError } = await supabase
        .from("authorized_retailers")
        .insert({
          factory_id: invitation.factory_id,
          retailer_id: retailerId,
          authorized_by: invitation.invited_by,
          status: "active",
        });

      if (authError) {
        console.error("Error creating authorized_retailer:", authError);
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Convite inválido ou expirado",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    await supabase
      .from("factory_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    const { error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    });

    if (linkError) {
      console.error("Error generating magic link:", linkError);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Autorização aceita com sucesso",
        redirect: `${SITE_URL}/auth/callback`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("accept-factory-invitation unhandled error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Convite inválido ou expirado",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
