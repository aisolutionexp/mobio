"use client";

import { useState } from "react";

import { AuditLogRowItem } from "@/components/domain/admin/audit-log-row";
import { AuditLogDetailDialog } from "@/components/domain/admin/audit-log-detail-dialog";
import type { AuditLogRow } from "@/lib/actions/audit-logs";

interface AuditLogTableProps {
  logs: AuditLogRow[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left">
              <th className="pr-4 pb-2 font-medium">Data</th>
              <th className="pr-4 pb-2 font-medium">Tabela</th>
              <th className="pr-4 pb-2 font-medium">Operação</th>
              <th className="pr-4 pb-2 font-medium">Record</th>
              <th className="pb-2 font-medium">Ator</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {logs.map((log) => (
              <AuditLogRowItem
                key={log.id}
                log={log}
                onSelect={setSelectedId}
              />
            ))}
          </tbody>
        </table>
      </div>

      <AuditLogDetailDialog
        logId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
