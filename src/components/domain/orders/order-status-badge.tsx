import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "warning" | "info" | "accent" | "success" | "destructive";
  }
> = {
  pending: { label: "Pendente", variant: "warning" },
  processing: { label: "Processando", variant: "info" },
  shipped: { label: "Enviado", variant: "accent" },
  delivered: { label: "Entregue", variant: "success" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    variant: "outline" as const,
  };
  return (
    <Badge variant={config.variant as "warning"} size="sm" dot>
      {config.label}
    </Badge>
  );
}
