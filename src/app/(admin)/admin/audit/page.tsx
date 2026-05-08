import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AuditLogFilters } from "@/components/domain/admin/audit-log-filters";
import { AuditLogTable } from "@/components/domain/admin/audit-log-table";
import { listAuditLogs } from "@/lib/actions/audit-logs";

const PAGE_SIZE = 25;

async function AuditLogContent({
  table,
  page,
}: {
  table?: string;
  page: number;
}) {
  const result = await listAuditLogs({ table, page });

  if (!result.success) {
    return (
      <p className="text-destructive py-8 text-center text-sm">
        {result.error}
      </p>
    );
  }

  const { logs, total } = result.data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (logs.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
        <ShieldCheck className="text-muted-foreground/50 size-10" />
        <p className="text-sm">Nenhum registro encontrado</p>
      </div>
    );
  }

  function buildUrl(p: number) {
    const sp = new URLSearchParams();
    if (table) sp.set("table", table);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/audit${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Plate padded>
        <AuditLogTable logs={logs} />
      </Plate>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          {page > 1 && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={buildUrl(page - 1)} />}
            >
              Anterior
            </Button>
          )}
          <span className="text-muted-foreground text-sm">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={buildUrl(page + 1)} />}
            >
              Próxima
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; page?: string }>;
}) {
  const params = await searchParams;
  const table = params.table || undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Administração"
        title="Audit Log"
        description="Histórico de alterações em tabelas críticas"
      />

      <Suspense fallback={null}>
        <AuditLogFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        }
      >
        <AuditLogContent table={table} page={page} />
      </Suspense>
    </div>
  );
}
