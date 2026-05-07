import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  email: z.string().email("Email inválido"),
  full_name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
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
    const parsed = acceptInviteSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { token, email, full_name } = parsed.data;
    const supabase = createAdminClient();
    const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("id, email, role, status, expires_at, factory_id, retailer_id")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ ok: false, error: "Convite inválido ou expirado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from("invites")
        .update({ status: "expired" })
        .eq("id", invite.id);

      return new Response(
        JSON.stringify({ ok: false, error: "Convite expirado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Email não corresponde ao convite",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const tenantId = invite.factory_id ?? invite.retailer_id;
    if (!tenantId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Convite sem tenant associado" }),
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
        user_metadata: { full_name },
      });

    if (createError) {
      if (
        createError.message?.includes("already been registered") ||
        createError.message?.includes("User already registered")
      ) {
        const foundId = await getUserIdByEmail(email);
        if (!foundId) {
          return new Response(
            JSON.stringify({ ok: false, error: "Usuário não encontrado" }),
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
          JSON.stringify({ ok: false, error: "Erro ao criar usuário" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      userId = authUser.user.id;

      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name,
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    }

    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id, is_active")
      .eq("user_id", userId)
      .eq(invite.factory_id ? "factory_id" : "retailer_id", tenantId)
      .maybeSingle();

    if (existingMember) {
      if (!existingMember.is_active) {
        await supabase
          .from("team_members")
          .update({ is_active: true, role: invite.role })
          .eq("id", existingMember.id);
      }
    } else {
      const memberData: Record<string, unknown> = {
        user_id: userId,
        role: invite.role,
      };
      if (invite.factory_id) memberData.factory_id = invite.factory_id;
      if (invite.retailer_id) memberData.retailer_id = invite.retailer_id;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert(memberData);

      if (memberError) {
        console.error("Error creating team_member:", memberError);
        return new Response(
          JSON.stringify({ ok: false, error: "Erro ao adicionar membro" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    await supabase
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

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
        message: "Convite aceito com sucesso",
        redirect: `${SITE_URL}/auth/callback`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("accept-invite unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
