import { z } from "npm:zod@3.24.4";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const searchSchema = z.object({
  query: z.string().max(200).optional(),
  factory_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(0).default(0),
});

Deno.serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return json({ ok: false, error: "unauthorized" }, 401);
    }

    let body: unknown = {};
    if (req.method === "POST") {
      body = await req.json();
    } else if (req.method === "GET") {
      const url = new URL(req.url);
      body = Object.fromEntries(url.searchParams.entries());
    } else {
      return json({ ok: false, error: "method_not_allowed" }, 405);
    }

    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.errors[0].message }, 400);
    }

    const { query, factory_id, category_id, limit, page } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return json({ ok: false, error: "unauthorized" }, 401);
    }

    const offset = page * limit;
    const fetchLimit = limit + 1;

    let queryBuilder = supabase
      .from("products")
      .select(
        "id, name, slug, wholesale_price, reference, factory_id, status, factories!inner(id, name, slug, is_active), product_images(id, path, sort_order, is_cover)",
      )
      .eq("status", "published")
      .eq("is_active", true)
      .eq("factories.is_active", true)
      .range(offset, offset + fetchLimit - 1)
      .order("created_at", { ascending: false });

    if (query && query.trim().length > 0) {
      queryBuilder = queryBuilder.ilike("name", `%${query.trim()}%`);
    }

    if (factory_id) {
      queryBuilder = queryBuilder.eq("factory_id", factory_id);
    }

    if (category_id) {
      queryBuilder = queryBuilder.eq("category_id", category_id);
    }

    const { data: products, error: queryError } = await queryBuilder;

    if (queryError) {
      console.error("search-products query error:", queryError);
      return json({ ok: false, error: "query_failed" }, 500);
    }

    const items = products ?? [];
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;

    return json({
      ok: true,
      results: results.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        wholesalePrice: p.wholesale_price,
        reference: p.reference,
        factoryId: p.factory_id,
        factory: p.factories,
        coverImage:
          (
            p.product_images as {
              id: string;
              path: string;
              sort_order: number;
              is_cover: boolean;
            }[]
          )?.find((i) => i.is_cover) ??
          (
            p.product_images as {
              id: string;
              path: string;
              sort_order: number;
              is_cover: boolean;
            }[]
          )?.[0] ??
          null,
      })),
      hasMore,
      page,
    });
  } catch (err) {
    console.error("search-products unhandled error:", err);
    return json({ ok: false, error: "internal_error" }, 500);
  }
});
