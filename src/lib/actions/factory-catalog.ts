"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const uuidSchema = z.string().uuid();

export async function getFactoryCollections(factoryId: string) {
  const parsed = uuidSchema.safeParse(factoryId);
  if (!parsed.success) return [];

  const supabase = await createClient();

  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, season, year, status")
    .eq("factory_id", parsed.data)
    .eq("status", "published")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !collections) return [];

  const collectionIds = collections.map((c) => c.id);
  if (collectionIds.length === 0)
    return collections.map((c) => ({ ...c, coverImageUrl: null }));

  const { data: products } = await supabase
    .from("products")
    .select("id, collection_id, product_images(path, sort_order)")
    .in("collection_id", collectionIds)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  const coverMap = new Map<string, string>();
  for (const product of products ?? []) {
    if (product.collection_id && !coverMap.has(product.collection_id)) {
      const images = product.product_images as {
        path: string;
        sort_order: number;
      }[];
      if (images.length > 0) {
        const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
        coverMap.set(product.collection_id, sorted[0].path);
      }
    }
  }

  const pathsToSign = [...coverMap.values()];
  const signedUrlMap = new Map<string, string>();
  if (pathsToSign.length > 0) {
    const { data: signedData } = await supabase.storage
      .from("product-photos")
      .createSignedUrls(pathsToSign, 3600);

    if (signedData) {
      for (const item of signedData) {
        if (item.signedUrl) {
          signedUrlMap.set(item.path!, item.signedUrl);
        }
      }
    }
  }

  return collections.map((c) => {
    const path = coverMap.get(c.id);
    return {
      ...c,
      coverImageUrl: path ? (signedUrlMap.get(path) ?? null) : null,
    };
  });
}

export async function getFactoryFeaturedProducts(factoryId: string) {
  const parsed = uuidSchema.safeParse(factoryId);
  if (!parsed.success) return [];

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, wholesale_price, retail_price, reference, product_images(id, path, sort_order, is_cover)",
    )
    .eq("factory_id", parsed.data)
    .eq("status", "published")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !products) return [];

  const allPaths: string[] = [];
  for (const product of products) {
    const images = product.product_images as {
      id: string;
      path: string;
      sort_order: number;
      is_cover: boolean;
    }[];
    if (images.length > 0) {
      const cover =
        images.find((i) => i.is_cover) ??
        [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
      allPaths.push(cover.path);
    }
  }

  const signedUrlMap = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: signedData } = await supabase.storage
      .from("product-photos")
      .createSignedUrls(allPaths, 3600);

    if (signedData) {
      for (const item of signedData) {
        if (item.signedUrl) {
          signedUrlMap.set(item.path!, item.signedUrl);
        }
      }
    }
  }

  return products.map((product) => {
    const images = product.product_images as {
      id: string;
      path: string;
      sort_order: number;
      is_cover: boolean;
    }[];
    const cover =
      images.find((i) => i.is_cover) ??
      [...images].sort((a, b) => a.sort_order - b.sort_order)[0];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      wholesalePrice: product.wholesale_price,
      retailPrice: product.retail_price,
      reference: product.reference,
      coverImageUrl: cover ? (signedUrlMap.get(cover.path) ?? null) : null,
    };
  });
}

export async function getProductDetail(productId: string) {
  const parsed = uuidSchema.safeParse(productId);
  if (!parsed.success) return null;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, description, wholesale_price, retail_price, reference, min_order_qty, status,
       factory_id, collection_id,
       collections(id, name, slug, factory_id, factories(id, name, slug))`,
    )
    .eq("id", parsed.data)
    .eq("status", "published")
    .single();

  if (error || !product) return null;

  const [imagesResult, specsResult, finishesResult, settingsResult] =
    await Promise.all([
      supabase
        .from("product_images")
        .select("id, path, alt_text, sort_order, is_cover")
        .eq("product_id", parsed.data)
        .order("sort_order"),
      supabase
        .from("product_specs")
        .select("id, spec_key, spec_value, sort_order")
        .eq("product_id", parsed.data)
        .order("sort_order"),
      supabase
        .from("finishes")
        .select("id, name, description")
        .eq("factory_id", product.factory_id)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("factory_settings")
        .select("shipping_policy")
        .eq("factory_id", product.factory_id)
        .maybeSingle(),
    ]);

  const images = (imagesResult.data ?? []) as {
    id: string;
    path: string;
    alt_text: string | null;
    sort_order: number;
    is_cover: boolean;
  }[];

  const paths = images.map((i) => i.path);
  const signedUrlMap = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signedData } = await supabase.storage
      .from("product-photos")
      .createSignedUrls(paths, 3600);

    if (signedData) {
      for (const item of signedData) {
        if (item.signedUrl) {
          signedUrlMap.set(item.path!, item.signedUrl);
        }
      }
    }
  }

  const collection = product.collections as {
    id: string;
    name: string;
    slug: string;
    factory_id: string;
    factories: { id: string; name: string; slug: string };
  } | null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    wholesalePrice: product.wholesale_price,
    retailPrice: product.retail_price,
    reference: product.reference,
    minOrderQty: product.min_order_qty,
    factoryId: product.factory_id,
    collectionId: product.collection_id,
    factory: collection?.factories ?? null,
    collection: collection
      ? { id: collection.id, name: collection.name, slug: collection.slug }
      : null,
    images: images.map((img) => ({
      id: img.id,
      url: signedUrlMap.get(img.path) ?? "",
      altText: img.alt_text,
      sortOrder: img.sort_order,
      isCover: img.is_cover,
    })),
    specs: (specsResult.data ?? []) as {
      id: string;
      spec_key: string;
      spec_value: string;
      sort_order: number;
    }[],
    finishes: (finishesResult.data ?? []) as {
      id: string;
      name: string;
      description: string | null;
    }[],
    shippingPolicy: settingsResult.data?.shipping_policy ?? null,
  };
}
