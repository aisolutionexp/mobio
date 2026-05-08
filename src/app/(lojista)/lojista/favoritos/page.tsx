import Link from "next/link";
import { Heart } from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listFavoriteFactories,
  listFavoriteProducts,
} from "@/lib/actions/discover";
import { FavoriteTabs } from "@/components/domain/discover/favorite-tabs";

export default async function FavoritosPage() {
  const [favoriteFactories, favoriteProducts] = await Promise.all([
    listFavoriteFactories(),
    listFavoriteProducts(),
  ]);

  const factoryItems = favoriteFactories.map((fav) => {
    const factory = fav.factories as unknown as {
      id: string;
      name: string;
      slug: string;
      logo_path: string | null;
      description: string | null;
      region_id: string | null;
      regions: { id: string; name: string } | null;
    };
    return {
      favoriteId: fav.id,
      factoryId: fav.factory_id!,
      name: factory?.name ?? "Atelie",
      slug: factory?.slug ?? "",
      logoPath: factory?.logo_path ?? null,
      description: factory?.description ?? null,
      regionName: factory?.regions?.name ?? null,
    };
  });

  const productItems = favoriteProducts.map((fav) => {
    const product = fav.products as unknown as {
      id: string;
      name: string;
      slug: string;
      reference: string | null;
      wholesale_price: number | null;
      factory_id: string;
      factories: { id: string; name: string; slug: string } | null;
      product_images: { id: string; path: string; sort_order: number }[];
    };
    return {
      favoriteId: fav.id,
      productId: fav.product_id!,
      name: product?.name ?? "Produto",
      slug: product?.slug ?? "",
      reference: product?.reference ?? null,
      price: product?.wholesale_price ?? null,
      factoryName: product?.factories?.name ?? null,
      factorySlug: product?.factories?.slug ?? null,
      imagePath: product?.product_images?.[0]?.path ?? null,
    };
  });

  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Seus favoritos"
        title="Favoritos"
        description="Atelies e produtos que voce salvou"
      />

      <FavoriteTabs
        factoryCount={factoryItems.length}
        productCount={productItems.length}
        factoryContent={
          factoryItems.length === 0 ? (
            <EmptyState
              message="Voce ainda nao favoritou nenhum atelie."
              ctaLabel="Explorar atelies"
              ctaHref="/lojista/praca"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {factoryItems.map((f) => (
                <FavoriteFactoryCard key={f.favoriteId} factory={f} />
              ))}
            </div>
          )
        }
        productContent={
          productItems.length === 0 ? (
            <EmptyState
              message="Voce ainda nao favoritou nenhum produto."
              ctaLabel="Explorar atelies"
              ctaHref="/lojista/praca"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productItems.map((p) => (
                <FavoriteProductCard key={p.favoriteId} product={p} />
              ))}
            </div>
          )
        }
      />
    </div>
  );
}

function EmptyState({
  message,
  ctaLabel,
  ctaHref,
}: {
  message: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Heart className="text-muted-foreground size-10 opacity-30" />
      <p className="text-muted-foreground text-sm">{message}</p>
      <Button variant="outline" size="sm" render={<Link href={ctaHref} />}>
        {ctaLabel}
      </Button>
    </div>
  );
}

function FavoriteFactoryCard({
  factory,
}: {
  factory: {
    favoriteId: string;
    factoryId: string;
    name: string;
    slug: string;
    logoPath: string | null;
    description: string | null;
    regionName: string | null;
  };
}) {
  const initials = factory.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Plate>
      <Link
        href={`/fabrica/${factory.slug}`}
        className="flex items-start gap-4"
      >
        <Avatar
          alt={factory.name}
          src={factory.logoPath ?? undefined}
          fallback={initials}
          size="lg"
          shape="square"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-heading text-base leading-tight font-semibold hover:underline">
            {factory.name}
          </h3>
          {factory.regionName && (
            <p className="text-muted-foreground text-xs">
              {factory.regionName}
            </p>
          )}
          {factory.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {factory.description}
            </p>
          )}
        </div>
      </Link>
    </Plate>
  );
}

function FavoriteProductCard({
  product,
}: {
  product: {
    favoriteId: string;
    productId: string;
    name: string;
    slug: string;
    reference: string | null;
    price: number | null;
    factoryName: string | null;
    factorySlug: string | null;
    imagePath: string | null;
  };
}) {
  return (
    <Plate>
      <div className="space-y-2">
        <h3 className="font-heading text-base leading-tight font-semibold">
          {product.name}
        </h3>
        {product.reference && (
          <Badge variant="secondary" className="text-xs">
            REF: {product.reference}
          </Badge>
        )}
        {product.factoryName && (
          <p className="text-muted-foreground text-xs">
            por{" "}
            {product.factorySlug ? (
              <Link
                href={`/fabrica/${product.factorySlug}`}
                className="hover:underline"
              >
                {product.factoryName}
              </Link>
            ) : (
              product.factoryName
            )}
          </p>
        )}
        {product.price != null && (
          <p className="text-sm font-medium">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.price)}
          </p>
        )}
      </div>
    </Plate>
  );
}
