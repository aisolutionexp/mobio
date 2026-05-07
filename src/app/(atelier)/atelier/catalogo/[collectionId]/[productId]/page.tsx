import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { AppMetadata } from "@/lib/auth/permissions";
import { Masthead } from "@/components/editorial/masthead";
import { Badge } from "@/components/ui/badge";
import { ProductTabs } from "@/components/domain/catalog/product-tabs";
import { ProductImageUploader } from "@/components/domain/catalog/product-image-uploader";
import { ProductFinishesTab } from "@/components/domain/catalog/product-finishes-tab";
import { ProductSpecsTab } from "@/components/domain/catalog/product-specs-tab";
import { ProductDetailsForm } from "@/components/domain/catalog/product-details-form";
import { ProductStatusActions } from "@/components/domain/catalog/product-status-actions";

const STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  published: { label: "Publicado", variant: "success" as const },
  archived: { label: "Arquivado", variant: "outline" as const },
} as const;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string; productId: string }>;
}) {
  const { collectionId, productId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tenantId = (user?.app_metadata as AppMetadata | undefined)
    ?.active_tenant_id;

  if (!tenantId) notFound();

  const [
    { data: collection },
    { data: product },
    { data: images },
    { data: finishes },
    { data: specs },
  ] = await Promise.all([
    supabase
      .from("collections")
      .select("id, name")
      .eq("id", collectionId)
      .eq("factory_id", tenantId)
      .single(),
    supabase
      .from("products")
      .select(
        "id, name, reference, description, status, wholesale_price, created_at",
      )
      .eq("id", productId)
      .eq("factory_id", tenantId)
      .single(),
    supabase
      .from("product_images")
      .select("id, path, alt_text, is_cover, sort_order")
      .eq("product_id", productId)
      .eq("factory_id", tenantId)
      .order("sort_order"),
    supabase
      .from("finishes")
      .select("id, name, description, is_active")
      .eq("factory_id", tenantId)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("product_specs")
      .select("id, spec_key, spec_value, sort_order")
      .eq("product_id", productId)
      .order("sort_order"),
  ]);

  if (!collection || !product) notFound();

  const signedUrls: Record<string, string> = {};
  if (images && images.length > 0) {
    const paths = images.map((img) => img.path);
    const { data: urlsData } = await supabase.storage
      .from("product-photos")
      .createSignedUrls(paths, 3600);

    if (urlsData) {
      for (const entry of urlsData) {
        if (entry.signedUrl) {
          const path = paths[urlsData.indexOf(entry)];
          signedUrls[path] = entry.signedUrl;
        }
      }
    }
  }

  const pStatus =
    STATUS_BADGE[(product.status as keyof typeof STATUS_BADGE) ?? "draft"] ??
    STATUS_BADGE.draft;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          href="/atelier/catalogo"
          className="hover:text-foreground transition-colors"
        >
          Catálogo
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/atelier/catalogo/${collectionId}`}
          className="hover:text-foreground transition-colors"
        >
          {collection.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground truncate font-medium">
          {product.name}
        </span>
      </nav>

      <Masthead
        title={product.name}
        description={
          product.reference ? `REF: ${product.reference}` : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={pStatus.variant}>{pStatus.label}</Badge>
            <ProductStatusActions
              productId={productId}
              collectionId={collectionId}
              currentStatus={product.status ?? "draft"}
            />
          </div>
        }
      />

      <ProductTabs
        photosTab={
          <div className="mt-6">
            <ProductImageUploader
              productId={productId}
              images={
                images?.map((img) => ({
                  id: img.id,
                  path: img.path,
                  alt_text: img.alt_text,
                  is_cover: img.is_cover,
                  sort_order: img.sort_order,
                })) ?? []
              }
              signedUrls={signedUrls}
            />
          </div>
        }
        finishesTab={<ProductFinishesTab finishes={finishes ?? []} />}
        specsTab={<ProductSpecsTab productId={productId} specs={specs ?? []} />}
        detailsTab={
          <ProductDetailsForm
            product={{
              id: product.id,
              name: product.name,
              reference: product.reference,
              description: product.description,
              wholesale_price: product.wholesale_price,
              status: product.status,
              created_at: product.created_at,
            }}
            collectionId={collectionId}
          />
        }
      />
    </div>
  );
}
