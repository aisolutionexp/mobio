"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUSES = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "verified", label: "Verificados" },
  { value: "rejected", label: "Recusados" },
  { value: "unverified", label: "Não verificados" },
] as const;

export function RetailerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentQuery = searchParams.get("q") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("page");
      router.push(`/admin/lojistas?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <Button
            key={s.value}
            size="sm"
            variant={currentStatus === s.value ? "default" : "outline"}
            onClick={() => updateParams({ status: s.value })}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="relative sm:ml-auto sm:max-w-xs sm:flex-1">
        <Search
          aria-hidden="true"
          className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          placeholder="Buscar por nome, email..."
          defaultValue={currentQuery}
          className="h-8 pl-8"
          aria-label="Buscar lojistas"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ q: e.currentTarget.value });
            }
          }}
        />
      </div>
    </div>
  );
}
