import { cache, Suspense } from "react";
import { DollarSign, ShoppingBag, Ticket, Factory } from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/domain/analytics/kpi-card";
import { TopList } from "@/components/domain/analytics/top-list";
import { PeriodSelector } from "@/components/domain/analytics/period-selector";
import { getRetailerAnalytics } from "@/lib/actions/analytics";
import { formatBRL } from "@/lib/utils";
import type { PeriodKey } from "@/lib/validators/analytics";

const getCachedRetailerAnalytics = cache(getRetailerAnalytics);

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}

function TopListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

async function RetailerKpis({ period }: { period: PeriodKey }) {
  const data = await getCachedRetailerAnalytics(period);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard
        label="Total gasto"
        value={formatBRL(data.total_spent_cents / 100)}
        icon={DollarSign}
      />
      <KpiCard
        label="Pedidos"
        value={String(data.orders_count)}
        icon={ShoppingBag}
      />
      <KpiCard
        label="Ticket médio"
        value={formatBRL(data.avg_ticket_cents / 100)}
        icon={Ticket}
      />
      <KpiCard
        label="Atelies distintos"
        value={String(
          Array.isArray(data.top_factories) ? data.top_factories.length : 0,
        )}
        icon={Factory}
      />
    </div>
  );
}

async function RetailerTopLists({ period }: { period: PeriodKey }) {
  const data = await getCachedRetailerAnalytics(period);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TopList title="Top atelies" items={data.top_factories} />
      <TopList title="Top categorias" items={data.top_categories} />
    </div>
  );
}

export default async function RetailerAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as PeriodKey) ?? "30d";

  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Sua conta"
        title="Analytics"
        description="Acompanhe seus pedidos e parceiros"
        actions={
          <Suspense fallback={null}>
            <PeriodSelector basePath="/lojista/conta/analytics" />
          </Suspense>
        }
      />

      <Suspense fallback={<KpiSkeleton />}>
        <RetailerKpis period={period} />
      </Suspense>

      <section>
        <Eyebrow as="p" withRule>
          Rankings do período
        </Eyebrow>

        <div className="mt-4">
          <Suspense fallback={<TopListSkeleton />}>
            <RetailerTopLists period={period} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
