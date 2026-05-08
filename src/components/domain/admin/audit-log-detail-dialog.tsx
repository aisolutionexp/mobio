"use client";

import { useEffect, useState, useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getAuditLogDetail,
  type AuditLogDetail,
} from "@/lib/actions/audit-logs";

interface AuditLogDetailDialogProps {
  logId: string | null;
  onClose: () => void;
}

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  if (data == null) {
    return (
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
          {label}
        </p>
        <p className="text-muted-foreground text-sm italic">Sem dados</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
        {label}
      </p>
      <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export function AuditLogDetailDialog({
  logId,
  onClose,
}: AuditLogDetailDialogProps) {
  const [detail, setDetail] = useState<AuditLogDetail | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!logId) return;
    startTransition(async () => {
      const result = await getAuditLogDetail(logId);
      if (result.success) setDetail(result.data);
    });
  }, [logId]);

  return (
    <Dialog open={!!logId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl"
        onCloseAutoFocus={() => setDetail(null)}
      >
        <DialogHeader>
          <DialogTitle>Detalhes do log</DialogTitle>
        </DialogHeader>

        {pending ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Carregando...
          </p>
        ) : detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Tabela</p>
                <p className="font-medium">{detail.table_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Operacao</p>
                <Badge variant="secondary" size="sm">
                  {detail.operation}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Record ID</p>
                <p className="font-mono text-xs">{detail.record_id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Ator</p>
                <p className="text-sm">
                  {detail.actor_email ??
                    detail.actor_user_id?.slice(0, 8) ??
                    "Sistema"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Data</p>
                <p className="text-sm">
                  {new Date(detail.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <JsonBlock label="Antes" data={detail.before_data} />
              <JsonBlock label="Depois" data={detail.after_data} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
