import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { isUserAuthorizedForFactory } from "@/lib/actions/factory-page";
import { getProductDetail } from "@/lib/actions/factory-catalog";
import { listRetailerBoards } from "@/lib/actions/boards";
import { listRetailerLinesheets } from "@/lib/actions/linesheets";
import { formatBRL } from "@/lib/utils";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Plate } from "@/components/editorial/plate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/domain/product/product-gallery";
import { ProductTabs } from "@/components/domain/product/product-tabs";
import { FavoriteButton } from "@/components/domain/discover/favorite-button";
import { AddToBoardDialog } from "@/components/domain/boards/add-to-board-dialog";
import { AddToLinesheetDialog } from "@/components/domain/linesheets/add-to-linesheet-dialog";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const product = await getProductDetail(productId);

  if (!product) {
    notFound();
  }

  if (product.factory?.slug !== slug) {
    notFound();
  }

  const auth = await isUserAuthorizedForFactory(product.factoryId);

  const isRetailer =
    auth.role === "lojista_owner" || auth.role === "lojista_buyer";
  let retailerBoards: { id: string; name: string; itemCount: number }[] = [];
  let retailerLinesheets: {
    id: string;
    name: string;
    itemCount: number;
    pricingVariant: string;
  }[] = [];
  if (isRetailer) {
    try {
      const [boards, linesheets] = await Promise.all([
        listRetailerBoards(),
        listRetailerLinesheets(),
      ]);
      retailerBoards = boards.map((b) => ({
        id: b.id,
        name: b.name,
        itemCount: b.itemCount,
      }));
      retailerLinesheets = linesheets.map((l) => ({
        id: l.id,
        name: l.name,
        itemCount: l.itemCount,
        pricingVariant: l.pricing_variant,
      }));
    } catch {
      // retailer access may fail if user context changed
    }
  }

  if (!auth.authorized) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Plate className="text-center" accent>
          <h2 className="font-heading mb-2 text-lg font-semibold">
            Acesso restrito
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Você não tem acesso ao catálogo deste atelier.
          </p>
          <Button variant="accent" render={<Link href={`/fabrica/${slug}`} />}>
            Voltar para o atelier
          </Button>
        </Plate>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-6 flex items-center gap-1 text-sm">
        <Link
          href="/lojista/praca"
          className="hover:text-foreground transition-colors"
        >
          Descobrir
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/fabrica/${slug}`}
          className="hover:text-foreground transition-colors"
        >
          {product.factory?.name ?? "Atelier"}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Content grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <Eyebrow className="mb-2">Produto</Eyebrow>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              {product.name}
            </h1>
          </div>

          <div className="space-y-1">
            <p className="text-accent text-2xl font-bold">
              {formatBRL(product.wholesalePrice)}
            </p>
            {product.retailPrice && (
              <p className="text-muted-foreground text-sm">
                Preço sugerido: {formatBRL(product.retailPrice)}
              </p>
            )}
          </div>

          {product.reference && (
            <Badge variant="outline" size="sm">
              REF: {product.reference}
            </Badge>
          )}

          {product.minOrderQty > 1 && (
            <p className="text-muted-foreground text-sm">
              Pedido mínimo: {product.minOrderQty} unidades
            </p>
          )}

          {product.description && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {product.description}
            </p>
          )}

          <ProductTabs
            specs={product.specs}
            finishes={product.finishes}
            factoryName={product.factory?.name ?? null}
            shippingPolicy={product.shippingPolicy}
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <FavoriteButton
              targetId={product.id}
              type="product"
              isFavorited={false}
            />
            {isRetailer && (
              <>
                <AddToBoardDialog
                  productId={product.id}
                  boards={retailerBoards}
                />
                <AddToLinesheetDialog
                  productId={product.id}
                  linesheets={retailerLinesheets}
                />
              </>
            )}
            <Button variant="accent" disabled>
              Solicitar cotação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
