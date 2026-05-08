"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  searchFactoriesSchema,
  type SearchFactoriesInput,
} from "@/lib/validators/discover";

const PAGE_SIZE = 20;

export async function searchFactories(input: SearchFactoriesInput) {
  await requireRetailerAccess();

  const parsed = searchFactoriesSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { query, regionId, categoryId, page } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_factories", {
    query_text: query || undefined,
    region_id_filter: regionId || undefined,
    category_id_filter: categoryId || undefined,
    limit_count: PAGE_SIZE + 1,
  });

  if (error) throw new Error(error.message);

  const factories = data ?? [];
  const hasMore = factories.length > PAGE_SIZE;
  const items = hasMore ? factories.slice(0, PAGE_SIZE) : factories;

  const factoryIds = items.map((f) => f.id);

  const [regionsResult, categoriesResult] = await Promise.all([
    supabase
      .from("regions")
      .select("id, name")
      .in("id", items.map((f) => f.region_id).filter(Boolean) as string[]),
    supabase
      .from("factory_categories")
      .select("factory_id, categories(id, name, slug)")
      .in("factory_id", factoryIds),
  ]);

  const regionMap = new Map(
    (regionsResult.data ?? []).map((r) => [r.id, r.name]),
  );

  const categoryMap = new Map<
    string,
    { id: string; name: string; slug: string }[]
  >();
  for (const fc of categoriesResult.data ?? []) {
    const cats = categoryMap.get(fc.factory_id) ?? [];
    if (fc.categories) {
      cats.push(fc.categories as { id: string; name: string; slug: string });
    }
    categoryMap.set(fc.factory_id, cats);
  }

  return {
    factories: items.map((f) => ({
      ...f,
      regionName: f.region_id ? (regionMap.get(f.region_id) ?? null) : null,
      categories: categoryMap.get(f.id) ?? [],
    })),
    hasMore,
    page: page ?? 0,
  };
}

export async function listRegionsWithCount() {
  await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("regions")
    .select("id, name, code, factories(count)")
    .order("name");

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      factoryCount:
        (r.factories as unknown as { count: number }[])?.[0]?.count ?? 0,
    }))
    .filter((r) => r.factoryCount > 0);
}

export async function listCategoriesWithCount() {
  await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, factory_categories(count)")
    .order("sort_order");

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      factoryCount:
        (c.factory_categories as unknown as { count: number }[])?.[0]?.count ??
        0,
    }))
    .filter((c) => c.factoryCount > 0);
}

export async function listFavoriteFactories() {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(
      "id, factory_id, factories(id, name, slug, logo_path, description, region_id, regions(id, name))",
    )
    .eq("retailer_id", tenantId)
    .not("factory_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listFavoriteProducts() {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(
      "id, product_id, products(id, name, slug, reference, wholesale_price, factory_id, factories(id, name, slug), product_images(id, path, sort_order))",
    )
    .eq("retailer_id", tenantId)
    .not("product_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
