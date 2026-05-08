"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "draft", label: "Rascunhos" },
  { value: "published", label: "Publicadas" },
  { value: "archived", label: "Arquivadas" },
] as const;

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "all";

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/atelier/catalogo?${params.toString()}`);
  }

  return (
    <div className="flex gap-1" role="tablist" aria-label="Filtrar por status">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          role="tab"
          aria-selected={current === filter.value}
          onClick={() => handleFilter(filter.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            current === filter.value
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
