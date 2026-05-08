import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import {
  getFactoryCollections,
  getFactoryFeaturedProducts,
} from "@/lib/actions/factory-catalog";
import { formatBRL } from "@/lib/utils";
import { FeaturedSpread } from "@/components/editorial/featured-spread";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { getFactoryBySlug } from "@/lib/actions/factory-page";

type Factory = NonNullable<Awaited<ReturnType<typeof getFactoryBySlug>>>;

export async function FactoryAuthorizedView({ factory }: { factory: Factory }) {
  const [collections, featuredProducts] = await Promise.all([
    getFactoryCollections(factory.id),
    getFactoryFeaturedProducts(factory.id),
  ]);

  const initials = factory.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8">
      {factory.cover_path ? (
        <FeaturedSpread
          image={factory.cover_path}
          imageAlt={`Capa de ${factory.name}`}
          eyebrow="Atelier"
          title={factory.name}
          description={factory.regionName ?? undefined}
          height="md"
        />
      ) : (
        <div className="flex items-start gap-6">
          <Avatar
            alt={factory.name}
            fallback={initials}
            size="xl"
            shape="square"
            src={factory.logo_path ?? undefined}
          />
          <div className="space-y-1">
            <Eyebrow>Atelier</Eyebrow>
            <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
              {factory.name}
            </h1>
            {factory.regionName && (
              <p className="text-muted-foreground flex items-center gap-1 text-sm">
                <MapPin className="size-3.5" />
                {factory.regionName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sobre */}
      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          Sobre
        </Eyebrow>
        <Plate>
          <p className="text-muted-foreground text-base leading-relaxed">
            {factory.description ??
              "Este atelier ainda não adicionou uma descrição."}
          </p>
          {factory.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {factory.categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </Plate>
      </section>

      {/* Coleções */}
      {collections.length > 0 && (
        <section>
          <Eyebrow as="p" className="mb-4" withRule>
            Coleções
          </Eyebrow>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {collections.map((col) => (
              <Plate key={col.id} padded={false} className="overflow-hidden">
                <div className="bg-muted relative aspect-[4/3]">
                  {col.coverImageUrl ? (
                    <Image
                      src={col.coverImageUrl}
                      alt={col.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Skeleton className="size-12 rounded" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="font-heading text-sm leading-tight font-semibold">
                    {col.name}
                  </h3>
                  {col.season && (
                    <p className="text-muted-foreground text-xs">
                      {col.season} {col.year ?? ""}
                    </p>
                  )}
                </div>
              </Plate>
            ))}
          </div>
        </section>
      )}

      {/* Produtos em destaque */}
      {featuredProducts.length > 0 && (
        <section>
          <Eyebrow as="p" className="mb-4" withRule>
            Produtos em destaque
          </Eyebrow>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/fabrica/${factory.slug}/produto/${product.id}`}
                className="group"
              >
                <Plate padded={false} className="overflow-hidden">
                  <div className="bg-muted relative aspect-square">
                    {product.coverImageUrl ? (
                      <Image
                        src={product.coverImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Skeleton className="size-12 rounded" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-4">
                    <h3 className="font-heading text-sm leading-tight font-semibold group-hover:underline">
                      {product.name}
                    </h3>
                    <p className="text-accent text-sm font-medium">
                      {formatBRL(product.wholesalePrice)}
                    </p>
                    {product.reference && (
                      <p className="text-muted-foreground text-xs">
                        REF: {product.reference}
                      </p>
                    )}
                  </div>
                </Plate>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contato */}
      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          Contato
        </Eyebrow>
        <Plate>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                E-mail
              </dt>
              <dd className="mt-1 text-sm">
                {factory.email ?? "Não informado"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Telefone
              </dt>
              <dd className="mt-1 text-sm">
                {factory.phone ?? "Não informado"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Website
              </dt>
              <dd className="mt-1 text-sm">
                {factory.website ?? "Não informado"}
              </dd>
            </div>
          </dl>
        </Plate>
      </section>
    </div>
  );
}
