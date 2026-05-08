"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

const TABLES = [
  { value: "", label: "Todas" },
  { value: "factories", label: "Atelies" },
  { value: "retailers", label: "Lojistas" },
  { value: "orders", label: "Pedidos" },
  { value: "team_members", label: "Membros" },
  { value: "factory_settings", label: "Config." },
  { value: "factory_invitations", label: "Convites" },
  { value: "authorized_retailers", label: "Autorizações" },
  { value: "plans", label: "Planos" },
  { value: "subscriptions", label: "Assinaturas" },
  { value: "statements", label: "Statements" },
];

export function AuditLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTable = searchParams.get("table") ?? "";

  const handleSelect = useCallback(
    (table: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (table) {
        params.set("table", table);
      } else {
        params.delete("table");
      }
      params.delete("page");
      const qs = params.toString();
      router.push(`/admin/audit${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {TABLES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => handleSelect(t.value)}
          className={cn(
            "focus-visible:ring-ring inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            currentTable === t.value
              ? "bg-primary text-primary-foreground border-transparent"
              : "border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
