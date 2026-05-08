import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { listFactoryStatements } from "@/lib/actions/statements";
import { formatBRL } from "@/lib/utils";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { StatementRow } from "@/components/domain/financeiro/statement-row";

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Plate key={i}>
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted mt-2 h-8 w-32 animate-pulse rounded" />
        </Plate>
      ))}
    </div>
  );
}

async function FinanceiroContent() {
  await requireFactoryAccess();
  const result = await listFactoryStatements();
  if (!result.success) throw new Error(result.error);

  const statements = result.data;

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const next30 = new Date(now);
  next30.setDate(next30.getDate() + 30);

  const currentMonthStatement = statements.find(
    (s) => s.period_start.slice(0, 7) === currentMonth,
  );
  const gmvCurrent = currentMonthStatement?.gmv_cents ?? 0;

  const pendingStatements = statements.filter((s) => s.status === "issued");
  const receivable30d = pendingStatements.reduce(
    (sum, s) => sum + s.net_cents,
    0,
  );

  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const received12m = statements
    .filter(
      (s) => s.status === "paid" && new Date(s.period_start) >= twelveMonthsAgo,
    )
    .reduce((sum, s) => sum + s.net_cents, 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Plate eyebrow="Faturado mês corrente">
          <p className="font-heading text-2xl font-bold">
            {formatBRL(gmvCurrent / 100)}
          </p>
        </Plate>
        <Plate eyebrow="A receber (próx. 30d)">
          <p className="font-heading text-2xl font-bold">
            {formatBRL(receivable30d / 100)}
          </p>
        </Plate>
        <Plate eyebrow="Total recebido (12m)">
          <p className="font-heading text-2xl font-bold">
            {formatBRL(received12m / 100)}
          </p>
        </Plate>
      </div>

      <Plate eyebrow="Statements mensais" title="Histórico de faturamento">
        {statements.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum statement gerado ainda.
          </p>
        ) : (
          <div className="divide-border -mx-4 divide-y">
            {statements.map((s) => (
              <StatementRow key={s.id} statement={s} />
            ))}
          </div>
        )}
      </Plate>
    </>
  );
}

export default function FinanceiroPage() {
  return (
    <div className="space-y-8">
      <nav className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          href="/atelier/conta"
          className="hover:text-foreground transition-colors"
        >
          Conta
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">Financeiro</span>
      </nav>

      <Masthead
        eyebrow="Conta"
        title="Financeiro"
        description="Acompanhe seu faturamento e statements mensais"
      />

      <Suspense fallback={<KPISkeleton />}>
        <FinanceiroContent />
      </Suspense>
    </div>
  );
}
