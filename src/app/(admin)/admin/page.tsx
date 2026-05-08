import { Suspense } from "react";
import Link from "next/link";
import {
  Factory,
  Store,
  ShoppingBag,
  DollarSign,
  UserPlus,
  Users,
  ShieldCheck,
  Receipt,
  Clock,
} from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/domain/analytics/kpi-card";
import { getAdminOverview, getRecentAuditLogs } from "@/lib/actions/analytics";
import { formatBRL } from "@/lib/utils";

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}

async function AdminKpis() {
  const data = await getAdminOverview();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <KpiCard
        label="Atelies"
        value={String(data.total_factories)}
        icon={Factory}
      />
      <KpiCard
        label="Lojistas"
        value={String(data.total_retailers)}
        icon={Store}
      />
      <KpiCard
        label="Pedidos"
        value={String(data.total_orders)}
        icon={ShoppingBag}
      />
      <KpiCard
        label="GMV total"
        value={formatBRL(data.total_gmv_cents / 100)}
        icon={DollarSign}
      />
      <KpiCard
        label="Signups (30d)"
        value={String(data.signups_last_30d)}
        icon={UserPlus}
      />
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    label: "Lojistas",
    description: "Verificação e gestão",
    href: "/admin/lojistas",
    icon: Users,
  },
  {
    label: "Audit Log",
    description: "Histórico de alterações",
    href: "/admin/audit",
    icon: ShieldCheck,
  },
  {
    label: "Statements",
    description: "Faturas mensais",
    href: "/admin/statements",
    icon: Receipt,
  },
  {
    label: "Usuários",
    description: "Gestão de acesso",
    href: "/admin/users",
    icon: Users,
  },
] as const;

const OPERATION_LABELS: Record<string, string> = {
  INSERT: "Criação",
  UPDATE: "Atualização",
  DELETE: "Remoção",
};

const TABLE_LABELS: Record<string, string> = {
  factories: "Atelier",
  retailers: "Lojista",
  orders: "Pedido",
  team_members: "Membro",
  factory_settings: "Configuração",
  factory_invitations: "Convite",
  authorized_retailers: "Autorização",
  plans: "Plano",
  subscriptions: "Assinatura",
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

async function RecentActivity() {
  const logs = await getRecentAuditLogs(10);

  if (logs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhuma atividade recente.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {logs.map((log, i) => (
        <div key={log.id}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                <Clock
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {OPERATION_LABELS[log.operation] ?? log.operation}{" "}
                  <span className="text-muted-foreground font-normal">
                    em {TABLE_LABELS[log.table_name] ?? log.table_name}
                  </span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {log.record_id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <span className="text-muted-foreground text-xs">
              {formatRelativeTime(log.created_at)}
            </span>
          </div>
          {i < logs.length - 1 && <Rule spacing="sm" variant="dotted" />}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Masthead eyebrow="Painel" title="Administração" />

      <Suspense fallback={<KpiSkeleton />}>
        <AdminKpis />
      </Suspense>

      <section>
        <Eyebrow as="p" withRule>
          Ações rápidas
        </Eyebrow>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Plate padded className="hover:border-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                      <Icon
                        aria-hidden="true"
                        className="text-muted-foreground size-5"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-muted-foreground text-xs">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Plate>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <Eyebrow as="p" withRule>
          Atividade recente
        </Eyebrow>

        <div className="mt-4">
          <Plate padded>
            <Suspense
              fallback={
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              }
            >
              <RecentActivity />
            </Suspense>
          </Plate>
        </div>
      </section>
    </div>
  );
}
