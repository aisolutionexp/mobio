import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getStatement } from "@/lib/actions/statements";
import { getExportStatementsCsvPayload } from "@/lib/actions/csv-export";
import { formatBRL } from "@/lib/utils";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { StatementStatusBadge } from "@/components/domain/financeiro/statement-status-badge";
import { ExportCsvButton } from "@/components/domain/financeiro/export-csv-button";

function formatPeriodLabel(start: string): string {
  return new Date(start + "T12:00:00").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getStatement(id);
  if (!result.success) throw new Error(result.error);

  const statement = result.data;
  const periodLabel = formatPeriodLabel(statement.period_start);

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
        <Link
          href="/atelier/financeiro"
          className="hover:text-foreground transition-colors"
        >
          Financeiro
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium capitalize">
          {periodLabel}
        </span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <Masthead
          title={periodLabel}
          description={`${formatDate(statement.period_start)} a ${formatDate(statement.period_end)}`}
          withRule={false}
          className="capitalize"
        />
        <StatementStatusBadge status={statement.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Plate eyebrow="GMV total">
          <p className="font-heading text-2xl font-bold">
            {formatBRL(statement.gmv_cents / 100)}
          </p>
        </Plate>
        <Plate eyebrow="Taxa da plataforma">
          <p className="font-heading text-2xl font-bold">
            {formatBRL(statement.fee_cents / 100)}
          </p>
        </Plate>
        <Plate eyebrow="Valor líquido" accent>
          <p className="font-heading text-accent text-2xl font-bold">
            {formatBRL(statement.net_cents / 100)}
          </p>
        </Plate>
      </div>

      <Plate
        eyebrow="Pedidos incluídos"
        title={`${statement.orders_count} pedido${statement.orders_count !== 1 ? "s" : ""} no período`}
      >
        {statement.orders.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum pedido encontrado no período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border text-muted-foreground border-b text-left">
                  <th className="pr-4 pb-2 font-medium">Pedido</th>
                  <th className="pr-4 pb-2 font-medium">Valor</th>
                  <th className="pr-4 pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Data entrega</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {statement.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2 pr-4 font-medium">
                      {order.order_number ?? order.id.slice(0, 8)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatBRL(order.total_cents / 100)}
                    </td>
                    <td className="py-2 pr-4 capitalize">{order.status}</td>
                    <td className="text-muted-foreground py-2">
                      {formatDate(order.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Plate>

      <div className="flex justify-end">
        <ExportCsvButton getExportData={getExportStatementsCsvPayload} />
      </div>
    </div>
  );
}
