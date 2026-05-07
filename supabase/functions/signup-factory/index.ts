import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

const signupFactorySchema = z.object({
  email: z.string().email("Email inválido"),
  factory_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(200),
  cnpj: z
    .string()
    .regex(CNPJ_REGEX, "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)"),
  region_id: z.string().uuid("region_id deve ser um UUID válido"),
  categories: z
    .array(z.string().uuid("category_id deve ser UUID"))
    .min(1, "Selecione ao menos 1 categoria"),
  whatsapp: z.string().optional(),
  responsible_name: z.string().min(1, "Nome do responsável é obrigatório"),
});

const SAFE_RESPONSE = {
  ok: true,
  message: "Se o email for válido, enviamos um link de cadastro.",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    const parsed = signupFactorySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const {
      email,
      factory_name,
      region_id,
      categories,
      whatsapp,
      responsible_name,
    } = parsed.data;
    const supabase = createAdminClient();
    const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

    // W4: validate region_id exists before any side-effects
    const { data: regionExists } = await supabase
      .from("regions")
      .select("id")
      .eq("id", region_id)
      .limit(1)
      .single();

    if (!regionExists) {
      return new Response(JSON.stringify(SAFE_RESPONSE), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // W4: validate all category ids exist
    if (categories.length > 0) {
      const { data: validCategories } = await supabase
        .from("categories")
        .select("id")
        .in("id", categories);

      if (!validCategories || validCategories.length !== categories.length) {
        return new Response(JSON.stringify(SAFE_RESPONSE), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const slug = slugify(factory_name);

    const { data: existingFactory } = await supabase
      .from("factories")
      .select("id, created_by")
      .or(`slug.eq.${slug}`)
      .limit(1)
      .single();

    if (existingFactory) {
      return new Response(JSON.stringify(SAFE_RESPONSE), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // B1: createUser directly, handle "already been registered" for idempotency
    const { data: newUser, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: { full_name: responsible_name },
      });

    if (userError || !newUser.user) {
      if (userError?.message?.includes("already been registered")) {
        return new Response(JSON.stringify(SAFE_RESPONSE), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Error creating user:", userError);
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
      full_name: responsible_name,
      phone: whatsapp ?? null,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    const { data: factory, error: factoryError } = await supabase
      .from("factories")
      .insert({
        name: factory_name,
        slug,
        email,
        phone: whatsapp ?? null,
        region_id,
        created_by: userId,
      })
      .select("id")
      .single();

    if (factoryError || !factory) {
      console.error("Error creating factory:", factoryError);
      return new Response(
        JSON.stringify({ ok: false, error: "internal_error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: memberError } = await supabase.from("team_members").insert({
      user_id: userId,
      factory_id: factory.id,
      role: "atelier_owner",
    });

    if (memberError) {
      console.error("Error creating team_member:", memberError);
    }

    const { error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    });

    if (linkError) {
      console.error("Error generating magic link:", linkError);
    }

    return new Response(JSON.stringify(SAFE_RESPONSE), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("signup-factory unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
