import Link from "next/link";
import { Factory, Calendar } from "lucide-react";

import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/domain/orders/order-status-badge";

function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

type RetailerOrderCardProps = {
  order: {
    id: string;
    order_number: string | null;
    status: string;
    total_cents: number;
    currency: string;
    created_at: string;
    factories: {
      id: string;
      name: string;
      slug: string;
      logo_path: string | null;
      region_id: string | null;
      regions: { name: string } | null;
    } | null;
  };
};

export function RetailerOrderCard({ order }: RetailerOrderCardProps) {
  const regionName = order.factories?.regions?.name;

  return (
    <Link
      href={`/lojista/pedidos/${order.id}`}
      className="hover:bg-muted/30 block rounded-lg transition-colors"
    >
      <Plate className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="font-heading text-base font-semibold tracking-wide">
              {order.order_number ?? "—"}
            </span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Factory aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{order.factories?.name ?? "Fábrica"}</span>
          {regionName && (
            <Badge variant="outline" size="sm">
              {regionName}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-heading text-foreground text-lg font-semibold">
            {formatCurrency(order.total_cents, order.currency)}
          </span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar aria-hidden="true" className="size-3.5" />
            {formatDate(order.created_at)}
          </span>
        </div>
      </Plate>
    </Link>
  );
}
