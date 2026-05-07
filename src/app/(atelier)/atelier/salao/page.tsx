import { Package, Users, ShoppingBag, DollarSign } from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";
import { Skeleton } from "@/components/ui/skeleton";

const METRICS = [
  { label: "Produtos ativos", value: "47", icon: Package },
  { label: "Lojistas conectados", value: "12", icon: Users },
  { label: "Pedidos abertos", value: "8", icon: ShoppingBag },
  { label: "Faturamento do mês", value: "R$ 24,5k", icon: DollarSign },
] as const;

export default function SalaoPage() {
  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Bem-vindo ao Salão"
        title="Atelier Mobio"
        description="Coleção ativa: Primavera/Verão 2027 · 23 peças"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {METRICS.map((metric) => {
          const MetricIcon = metric.icon;
          return (
            <Plate key={metric.label} accent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading text-3xl font-bold">
                    {metric.value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {metric.label}
                  </p>
                </div>
                <MetricIcon
                  aria-hidden="true"
                  className="text-muted-foreground size-5"
                />
              </div>
            </Plate>
          );
        })}
      </div>

      <section>
        <Eyebrow as="p" withRule>
          Atividade recente
        </Eyebrow>

        <div className="mt-4 space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 py-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              {i < 2 && <Rule spacing="sm" variant="dotted" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
