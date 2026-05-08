"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  id: string;
  name: string;
  count: number;
}

interface DiscoverFiltersProps {
  regions: FilterOption[];
  categories: FilterOption[];
}

export function DiscoverFilters({ regions, categories }: DiscoverFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRegion = searchParams.get("region") ?? "";
  const activeCategory = searchParams.get("category") ?? "";

  function toggleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/lojista/praca?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/lojista/praca?${params.toString()}`);
  }

  const hasFilters = activeRegion || activeCategory;

  return (
    <div className="space-y-3">
      {regions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Regiao
          </span>
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleFilter("region", r.id)}
              type="button"
            >
              <Badge
                variant={activeRegion === r.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  activeRegion === r.id && "bg-primary text-primary-foreground",
                )}
              >
                {r.name} ({r.count})
              </Badge>
            </button>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Categoria
          </span>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleFilter("category", c.id)}
              type="button"
            >
              <Badge
                variant={activeCategory === c.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  activeCategory === c.id &&
                    "bg-primary text-primary-foreground",
                )}
              >
                {c.name} ({c.count})
              </Badge>
            </button>
          ))}
        </div>
      )}

      {hasFilters && (
        <button
          onClick={clearFilters}
          type="button"
          className="text-muted-foreground hover:text-foreground text-xs underline transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
