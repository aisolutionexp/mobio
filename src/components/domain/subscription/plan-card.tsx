"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { changePlan } from "@/lib/actions/subscriptions";
import type { PlanData } from "@/lib/actions/subscriptions";
import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  plan: PlanData;
  isCurrent: boolean;
  canChange: boolean;
}

function formatPrice(cents: number): string {
  if (cents === 0) return "Grátis";
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

const FEATURE_LABELS: Record<string, string> = {
  catalogo_basico: "Catálogo básico",
  max_colecoes: "Coleções",
  linesheets: "Linesheets",
  showrooms: "Showrooms virtuais",
  analytics: "Analytics",
  max_produtos: "Produtos",
  api_access: "Acesso à API",
  priority_support: "Suporte prioritário",
};

function formatFeatureValue(
  key: string,
  value: boolean | number | null,
): string | null {
  const label = FEATURE_LABELS[key] ?? key;
  if (typeof value === "boolean") {
    return value ? label : null;
  }
  if (value === null) {
    return `${label}: ilimitado`;
  }
  return `${label}: ${value}`;
}

export function PlanCard({ plan, isCurrent, canChange }: PlanCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange() {
    if (!confirm(`Deseja trocar para o plano ${plan.name}?`)) return;
    startTransition(async () => {
      const result = await changePlan(plan.id);
      if (result.success) {
        toast.success(`Plano alterado para ${plan.name}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  const features = plan.features as Record<string, boolean | number | null>;
  const featureList = Object.entries(features)
    .map(([k, v]) => formatFeatureValue(k, v))
    .filter(Boolean) as string[];

  return (
    <Plate accent={isCurrent} className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
          {isCurrent && (
            <Badge variant="accent" size="sm">
              Atual
            </Badge>
          )}
        </div>

        <p className="font-heading text-accent mt-2 text-2xl font-bold">
          {formatPrice(plan.price_cents)}
          {plan.price_cents > 0 && (
            <span className="text-muted-foreground text-sm font-normal">
              /mês
            </span>
          )}
        </p>

        <ul className="mt-4 space-y-2">
          {featureList.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="text-accent mt-0.5 size-4 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        {isCurrent ? (
          <Button variant="outline" disabled className="w-full">
            Plano atual
          </Button>
        ) : canChange ? (
          <Button
            variant="accent"
            className="w-full"
            disabled={isPending}
            onClick={handleChange}
          >
            {isPending ? "Alterando..." : "Trocar para este plano"}
          </Button>
        ) : (
          <Button variant="outline" disabled className="w-full">
            Indisponível
          </Button>
        )}
      </div>
    </Plate>
  );
}
