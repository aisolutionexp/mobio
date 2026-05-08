import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { formatBRL } from "@/lib/utils";
import { StatementStatusBadge } from "@/components/domain/financeiro/statement-status-badge";
import type { StatementRow as StatementRowData } from "@/lib/actions/statements";

interface StatementRowProps {
  statement: StatementRowData;
}

function formatPeriod(start: string, end: string): string {
  return new Date(start + "T12:00:00").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function StatementRow({ statement }: StatementRowProps) {
  return (
    <Link
      href={`/atelier/financeiro/statements/${statement.id}`}
      className="hover:bg-muted/50 flex items-center justify-between gap-4 rounded-md px-4 py-3 transition-colors"
    >
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
        <span className="font-heading min-w-[140px] text-sm font-medium capitalize">
          {formatPeriod(statement.period_start, statement.period_end)}
        </span>
        <span className="text-muted-foreground min-w-[80px] text-sm">
          {statement.orders_count} pedido
          {statement.orders_count !== 1 ? "s" : ""}
        </span>
        <span className="min-w-[100px] text-sm font-medium">
          {formatBRL(statement.gmv_cents / 100)}
        </span>
        <span className="text-muted-foreground min-w-[80px] text-sm">
          Taxa: {formatBRL(statement.fee_cents / 100)}
        </span>
        <span className="text-accent min-w-[100px] text-sm font-semibold">
          Líq: {formatBRL(statement.net_cents / 100)}
        </span>
        <StatementStatusBadge status={statement.status} />
      </div>
      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
    </Link>
  );
}
