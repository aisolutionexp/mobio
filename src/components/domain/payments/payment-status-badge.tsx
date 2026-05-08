import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pendente", variant: "warning" },
  paid: { label: "Pago", variant: "success" },
  late: { label: "Atrasado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

interface PaymentStatusBadgeProps {
  status: string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const { label, variant } = STATUS_MAP[status] ?? {
    label: status,
    variant: "outline" as const,
  };

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}
