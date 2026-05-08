"use server";

import { createClient } from "@/lib/supabase/server";

export interface PublicLinesheetData {
  id: string;
  name: string;
  pricingVariant: string;
  status: string;
  factoryName: string;
  factorySlug: string;
  factoryLogoUrl: string | null;
  items: PublicLinesheetItem[];
}

export interface PublicLinesheetItem {
  id: string;
  position: number;
  customPrice: number | null;
  note: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    reference: string | null;
    wholesalePrice: number | null;
    retailPrice: number | null;
    msrp: number | null;
    minOrderQty: number | null;
    images: string[];
  };
}

export async function getPublicLinesheetData(
  token: string,
): Promise<PublicLinesheetData | null> {
  if (!token || token.length < 10) return null;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_linesheet_by_token", {
    p_token: token,
  });

  if (error || !data) return null;

  const raw = data as {
    id: string;
    name: string;
    pricing_variant: string;
    status: string;
    factory_name: string;
    factory_slug: string;
    factory_logo_url: string | null;
    items: {
      id: string;
      position: number;
      custom_price: number | null;
      note: string | null;
      product: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        reference: string | null;
        wholesale_price: number | null;
        retail_price: number | null;
        msrp: number | null;
        min_order_qty: number | null;
        images: string[];
      };
    }[];
  };

  return {
    id: raw.id,
    name: raw.name,
    pricingVariant: raw.pricing_variant,
    status: raw.status,
    factoryName: raw.factory_name,
    factorySlug: raw.factory_slug,
    factoryLogoUrl: raw.factory_logo_url,
    items: (raw.items ?? []).map((item) => ({
      id: item.id,
      position: item.position,
      customPrice: item.custom_price,
      note: item.note,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        reference: item.product.reference,
        wholesalePrice: item.product.wholesale_price,
        retailPrice: item.product.retail_price,
        msrp: item.product.msrp,
        minOrderQty: item.product.min_order_qty,
        images: item.product.images ?? [],
      },
    })),
  };
}
