// MVP: pipeline de processamento de imagem de produto.
// Atualmente apenas valida o payload e retorna OK.
// Geração de variants (thumb/medium/large) será implementada
// quando o schema product_images for estendido com processing_status e sizes.

import { createAdminClient } from "../_shared/supabase.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { image_id } = await req.json();

    if (!image_id || typeof image_id !== "string") {
      return new Response(JSON.stringify({ error: "image_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();

    const { data: image, error: fetchError } = await supabase
      .from("product_images")
      .select("id, path, product_id, factory_id")
      .eq("id", image_id)
      .single();

    if (fetchError || !image) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MVP: no image processing — pipeline placeholder.
    // Future: download original, generate thumb/medium/large variants,
    // upload to storage, update product_images with processing_status and sizes.

    console.log(
      `[process-product-image] MVP: acknowledged image ${image_id}, path=${image.path}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        image_id,
        status: "acknowledged",
        message: "MVP placeholder — image processing not yet implemented",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[process-product-image] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
