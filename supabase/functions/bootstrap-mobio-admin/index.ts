import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const bootstrapSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(12, "Senha deve ter ao menos 12 caracteres")
    .regex(/[A-Z]/, "Senha deve conter ao menos 1 letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter ao menos 1 letra minúscula")
    .regex(/[0-9]/, "Senha deve conter ao menos 1 número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos 1 caractere especial"),
  bootstrap_secret: z.string().min(1, "bootstrap_secret é obrigatório"),
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
    const BOOTSTRAP_SECRET = Deno.env.get("BOOTSTRAP_SECRET");
    if (!BOOTSTRAP_SECRET) {
      console.error("BOOTSTRAP_SECRET not configured");
      return new Response(
        JSON.stringify({ ok: false, error: "server_misconfigured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    const parsed = bootstrapSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { email, password, bootstrap_secret } = parsed.data;

    if (bootstrap_secret !== BOOTSTRAP_SECRET) {
      return new Response(
        JSON.stringify({ ok: false, error: "unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createAdminClient();

    const { data: existingAdmins, error: countError } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("is_active", true);

    if (countError) {
      console.error("Error checking existing admins:", countError);
      return new Response(
        JSON.stringify({ ok: false, error: "internal_error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ ok: true, message: "Admin já existe." }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: newUser, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userError || !newUser.user) {
      if (userError?.message?.includes("already been registered")) {
        return new Response(
          JSON.stringify({ ok: true, message: "Admin já existe." }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      console.error("Error creating admin user:", userError);
      return new Response(
        JSON.stringify({ ok: false, error: "internal_error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const userId = newUser.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: "MOBIO Admin",
    });

    if (profileError) {
      console.error("Error creating admin profile:", profileError);
    }

    const { error: memberError } = await supabase.from("team_members").insert({
      user_id: userId,
      factory_id: null,
      retailer_id: null,
      role: "admin",
    });

    if (memberError) {
      console.error("Error creating admin team_member:", memberError);
      return new Response(
        JSON.stringify({ ok: false, error: "internal_error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, email, message: "Admin criado com sucesso." }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("bootstrap-mobio-admin unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
