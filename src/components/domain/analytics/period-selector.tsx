"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import type { PeriodKey } from "@/lib/validators/analytics";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "12m", label: "12 meses" },
];

interface PeriodSelectorProps {
  basePath: string;
}

export function PeriodSelector({ basePath }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") as PeriodKey) ?? "30d";

  const handleSelect = useCallback(
    (key: PeriodKey) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === "30d") {
        params.delete("period");
      } else {
        params.set("period", key);
      }
      const qs = params.toString();
      router.push(`${basePath}${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams, basePath],
  );

  return (
    <div className="flex gap-2">
      {PERIODS.map(({ key, label }) => (
        <Button
          key={key}
          variant={current === key ? "default" : "outline"}
          size="sm"
          onClick={() => handleSelect(key)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
