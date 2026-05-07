import { z } from "npm:zod@3.24.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const signupRetailerSchema = z.object({
  email: z.string().email("Email inválido"),
  retailer_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(200),
  region_id: z.string().uuid("region_id deve ser um UUID válido"),
  segments: z.array(z.string().uuid("segment_id deve ser UUID")).optional(),
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
    const parsed = signupRetailerSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { email, retailer_name, region_id, whatsapp, responsible_name } =
      parsed.data;
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

    const slug = slugify(retailer_name);

    const { data: existingRetailer } = await supabase
      .from("retailers")
      .select("id, created_by")
      .or(`slug.eq.${slug}`)
      .limit(1)
      .single();

    if (existingRetailer) {
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

    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .insert({
        name: retailer_name,
        slug,
        email,
        phone: whatsapp ?? null,
        region_id,
        created_by: userId,
      })
      .select("id")
      .single();

    if (retailerError || !retailer) {
      console.error("Error creating retailer:", retailerError);
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
      retailer_id: retailer.id,
      role: "lojista_owner",
    });

    if (memberError) {
      console.error("Error creating team_member:", memberError);
    }

    // TODO: segments (parsed.data.segments) não está no schema atual de retailers.
    // Quando a junction table for criada, persistir aqui.

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
    console.error("signup-retailer unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
