import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";

import { ORDER_STATUS_LABELS } from "@/lib/constants/order-status";

interface StatusHistoryEntry {
  id: string;
  from_status: string;
  to_status: string;
  notes: string | null;
  created_at: string;
  changed_by: string;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />;
    case "cancelled":
      return <XCircle className="text-destructive size-4 shrink-0" />;
    case "pending":
      return <Clock className="size-4 shrink-0 text-amber-500" />;
    default:
      return <Circle className="size-4 shrink-0 text-blue-500" />;
  }
}

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function OrderStatusTimeline({
  history,
  showNewIndicator = false,
}: {
  history: StatusHistoryEntry[];
  showNewIndicator?: boolean;
}) {
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        Nenhuma transição de status registrada
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {showNewIndicator && (
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          Atualizado agora
        </div>
      )}
      <ol className="border-border relative space-y-4 border-l pl-6">
        {sorted.map((entry) => (
          <li key={entry.id} className="relative">
            <span className="absolute top-0.5 -left-[calc(1.5rem+0.5rem)] flex items-center justify-center">
              <StatusIcon status={entry.to_status} />
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-x-2 text-sm">
                <span className="text-muted-foreground">
                  {ORDER_STATUS_LABELS[entry.from_status] ?? entry.from_status}
                </span>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="font-medium">
                  {ORDER_STATUS_LABELS[entry.to_status] ?? entry.to_status}
                </span>
              </div>
              {entry.notes && (
                <p className="text-muted-foreground text-xs">{entry.notes}</p>
              )}
              <span className="text-muted-foreground text-xs">
                {formatRelativeDate(entry.created_at)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export type { StatusHistoryEntry };
