import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  getRetailerCurrentSubscription,
  listRetailerPlans,
} from "@/lib/actions/subscriptions-retailer";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Badge } from "@/components/ui/badge";
import { RetailerPlanCard } from "@/components/domain/subscription/retailer-plan-card";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function LojistaPlanoPage() {
  const { role } = await requireRetailerAccess();
  const isOwner = role === "lojista_owner" || role === "admin";

  const [subResult, plansResult] = await Promise.all([
    getRetailerCurrentSubscription(),
    listRetailerPlans(),
  ]);

  if (!subResult.success) throw new Error(subResult.error);
  if (!plansResult.success) throw new Error(plansResult.error);

  const subscription = subResult.data;
  const plans = plansResult.data;

  return (
    <div className="space-y-8">
      <nav className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          href="/lojista/conta"
          className="hover:text-foreground transition-colors"
        >
          Minha conta
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">Plano e assinatura</span>
      </nav>

      <Masthead
        title="Plano e assinatura"
        description="Gerencie seu plano e veja os recursos disponíveis"
      />

      {subscription ? (
        <Plate eyebrow="Plano atual" title={subscription.plan.name} accent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="font-heading text-accent text-2xl font-bold">
                {subscription.plan.price_cents === 0
                  ? "Grátis"
                  : `R$ ${(subscription.plan.price_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`}
              </p>
              <Badge
                variant={
                  subscription.status === "active" ? "success" : "warning"
                }
                size="sm"
              >
                {subscription.status === "active"
                  ? "Ativo"
                  : subscription.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Período atual: {formatDate(subscription.current_period_start)} a{" "}
              {formatDate(subscription.current_period_end)}
            </p>
          </div>
        </Plate>
      ) : (
        <Plate accent>
          <div className="py-2 text-center">
            <Eyebrow as="p" variant="accent" className="mb-2">
              Nenhum plano ativo
            </Eyebrow>
            <p className="text-muted-foreground text-sm">
              Selecione um plano abaixo para começar
            </p>
          </div>
        </Plate>
      )}

      <div>
        <Eyebrow as="p" className="mb-4">
          Planos disponíveis
        </Eyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <RetailerPlanCard
              key={plan.id}
              plan={plan}
              isCurrent={subscription?.plan_id === plan.id}
              canChange={isOwner}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
