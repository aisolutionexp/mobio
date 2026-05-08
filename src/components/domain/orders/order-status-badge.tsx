import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants/order-status";

const STATUS_VARIANT: Record<
  string,
  "warning" | "info" | "accent" | "success" | "destructive"
> = {
  pending: "warning",
  processing: "info",
  shipped: "accent",
  delivered: "success",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const label = ORDER_STATUS_LABELS[status] ?? status;
  const variant = STATUS_VARIANT[status] ?? ("outline" as const);
  return (
    <Badge variant={variant as "warning"} size="sm" dot>
      {label}
    </Badge>
  );
}
