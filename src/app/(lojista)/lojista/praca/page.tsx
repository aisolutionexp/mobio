import Link from "next/link";
import { Suspense } from "react";

import { Masthead } from "@/components/editorial/masthead";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { RegionTile } from "@/components/editorial/region-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  searchFactories,
  listRegionsWithCount,
  listCategoriesWithCount,
} from "@/lib/actions/discover";
import { checkFavorites } from "@/lib/actions/favorites";
import { FactoryCard } from "@/components/domain/discover/factory-card";
import { DiscoverSearchBar } from "@/components/domain/discover/discover-search-bar";
import { DiscoverFilters } from "@/components/domain/discover/discover-filters";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function PracaPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    region?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page ?? "0", 10) || 0);

  const [result, regions, categories] = await Promise.all([
    searchFactories({
      query: params.q,
      regionId: params.region,
      categoryId: params.category,
      page,
    }),
    listRegionsWithCount(),
    listCategoriesWithCount(),
  ]);

  const factoryIds = result.factories.map((f) => f.id);
  const favoritedIds = await checkFavorites(factoryIds);

  const greeting = getGreeting();

  const hasActiveFilters = params.q || params.region || params.category;

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.region) sp.set("region", params.region);
    if (params.category) sp.set("category", params.category);
    if (p > 0) sp.set("page", String(p));
    const qs = sp.toString();
    return `/lojista/praca${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <Masthead
        eyebrow={greeting}
        title="Descubra atelies"
        description="Explore novos atelies e encontre os melhores parceiros para sua loja"
      />

      <Suspense fallback={<Skeleton className="h-10 max-w-lg" />}>
        <DiscoverSearchBar />
      </Suspense>

      {regions.length > 0 && !hasActiveFilters && (
        <section>
          <Eyebrow as="p" className="mb-4" withRule>
            Regioes em destaque
          </Eyebrow>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {regions.slice(0, 10).map((r) => (
              <RegionTile key={r.id} region={r} factoryCount={r.factoryCount} />
            ))}
          </div>
        </section>
      )}

      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <DiscoverFilters
          regions={regions.map((r) => ({
            id: r.id,
            name: r.name,
            count: r.factoryCount,
          }))}
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            count: c.factoryCount,
          }))}
        />
      </Suspense>

      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          {hasActiveFilters
            ? `${result.factories.length} resultado${result.factories.length !== 1 ? "s" : ""}`
            : "Todos os atelies"}
        </Eyebrow>

        {result.factories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhum atelie encontrado com os filtros selecionados.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/lojista/praca" />}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.factories.map((factory) => (
              <FactoryCard
                key={factory.id}
                factory={factory}
                isFavorited={favoritedIds.has(factory.id)}
              />
            ))}
          </div>
        )}

        {(page > 0 || result.hasMore) && (
          <div className="flex items-center justify-center gap-4 pt-6">
            {page > 0 && (
              <Button
                variant="outline"
                size="sm"
                render={<Link href={buildPageUrl(page - 1)} />}
              >
                Anterior
              </Button>
            )}
            <span className="text-muted-foreground text-sm">
              Pagina {page + 1}
            </span>
            {result.hasMore && (
              <Button
                variant="outline"
                size="sm"
                render={<Link href={buildPageUrl(page + 1)} />}
              >
                Proxima
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
