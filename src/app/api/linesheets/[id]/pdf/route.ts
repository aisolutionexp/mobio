import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import { renderLinesheetPdf } from "@/lib/pdf/linesheet-pdf";

const uuidSchema = z.string().uuid();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: linesheet, error: lsError } = await supabase
      .from("linesheets")
      .select("id, name, pricing_variant, status, created_at, retailer_id")
      .eq("id", parsed.data)
      .eq("retailer_id", tenantId)
      .single();

    if (lsError || !linesheet) {
      return NextResponse.json(
        { error: "Linesheet não encontrado" },
        { status: 404 },
      );
    }

    const { data: retailer } = await supabase
      .from("retailers")
      .select("name")
      .eq("id", tenantId)
      .single();

    const { data: items } = await supabase
      .from("linesheet_items")
      .select(
        `id, position, custom_price, note,
         products(id, name, reference, wholesale_price, retail_price, msrp,
           product_images(path, sort_order, is_cover),
           collections(factories(name)))`,
      )
      .eq("linesheet_id", parsed.data)
      .order("position", { ascending: true });

    const allPaths: string[] = [];
    for (const item of items ?? []) {
      const product = item.products as {
        product_images: {
          path: string;
          sort_order: number;
          is_cover: boolean;
        }[];
      } | null;
      if (product?.product_images?.length) {
        const cover =
          product.product_images.find((i) => i.is_cover) ??
          [...product.product_images].sort(
            (a, b) => a.sort_order - b.sort_order,
          )[0];
        if (cover) allPaths.push(cover.path);
      }
    }

    const signedUrlMap = new Map<string, string>();
    if (allPaths.length > 0) {
      const { data: signedData } = await supabase.storage
        .from("product-photos")
        .createSignedUrls(allPaths, 3600);

      if (signedData) {
        for (const entry of signedData) {
          if (entry.signedUrl) {
            signedUrlMap.set(entry.path!, entry.signedUrl);
          }
        }
      }
    }

    const pdfItems = (items ?? []).map((item) => {
      const product = item.products as {
        id: string;
        name: string;
        reference: string | null;
        wholesale_price: number | null;
        retail_price: number | null;
        msrp: number | null;
        product_images: {
          path: string;
          sort_order: number;
          is_cover: boolean;
        }[];
        collections: { factories: { name: string } } | null;
      } | null;

      let imageUrl: string | null = null;
      if (product?.product_images?.length) {
        const cover =
          product.product_images.find((i) => i.is_cover) ??
          [...product.product_images].sort(
            (a, b) => a.sort_order - b.sort_order,
          )[0];
        if (cover) imageUrl = signedUrlMap.get(cover.path) ?? null;
      }

      return {
        productName: product?.name ?? "Sem nome",
        reference: product?.reference ?? null,
        factoryName: product?.collections?.factories?.name ?? null,
        price: resolvePrice(
          linesheet.pricing_variant,
          item.custom_price,
          product?.wholesale_price ?? null,
          product?.retail_price ?? null,
          product?.msrp ?? null,
        ),
        note: item.note,
        imageUrl,
      };
    });

    const pdfBuffer = await renderLinesheetPdf({
      linesheetName: linesheet.name,
      retailerName: retailer?.name ?? "",
      pricingVariant: linesheet.pricing_variant,
      createdAt: linesheet.created_at,
      items: pdfItems,
    });

    const slug = linesheet.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="linesheet-${slug}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

function resolvePrice(
  variant: string,
  customPrice: number | null,
  wholesalePrice: number | null,
  retailPrice: number | null,
  msrp: number | null,
): number | null {
  if (customPrice != null) return customPrice;
  switch (variant) {
    case "retailer":
      return wholesalePrice;
    case "msrp":
      return msrp;
    case "custom":
      return customPrice;
    default:
      return wholesalePrice;
  }
}
