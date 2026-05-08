import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "secondary" | "info" | "success" | "destructive" | "warning";
  }
> = {
  draft: { label: "Rascunho", variant: "secondary" },
  sent: { label: "Enviada", variant: "info" },
  accepted: { label: "Aceita", variant: "success" },
  rejected: { label: "Rejeitada", variant: "destructive" },
  expired: { label: "Expirada", variant: "warning" },
};

export function QuoteStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return (
    <Badge variant={config.variant as "secondary"} size="sm" dot>
      {config.label}
    </Badge>
  );
}
