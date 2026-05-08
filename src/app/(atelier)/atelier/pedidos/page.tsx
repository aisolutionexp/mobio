import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";

import { listFactoryOrders } from "@/lib/actions/orders";
import { getExportOrdersCsvPayload } from "@/lib/actions/csv-export";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/domain/orders/order-status-badge";
import { ExportCsvButton } from "@/components/domain/financeiro/export-csv-button";

function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await listFactoryOrders(status ? { status } : undefined);

  const statuses = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendente" },
    { value: "processing", label: "Processando" },
    { value: "shipped", label: "Enviado" },
    { value: "delivered", label: "Entregue" },
    { value: "cancelled", label: "Cancelado" },
  ];

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Comércio"
        title="Pedidos"
        description="Gerencie os pedidos recebidos dos lojistas"
        actions={<ExportCsvButton getExportData={getExportOrdersCsvPayload} />}
      />

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={
              s.value
                ? `/atelier/pedidos?status=${s.value}`
                : "/atelier/pedidos"
            }
          >
            <Badge
              variant={(status ?? "") === s.value ? "default" : "outline"}
              size="lg"
              className="cursor-pointer"
            >
              {s.label}
            </Badge>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <ShoppingBag className="text-muted-foreground/50 size-10" />
          <p className="text-sm">Nenhum pedido encontrado</p>
          <p className="text-xs">
            Quando lojistas fizerem pedidos, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const retailer = order.retailers as unknown as {
              id: string;
              name: string;
              slug: string;
              logo_path: string | null;
            } | null;

            const initials =
              retailer?.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase() ?? "?";

            return (
              <Plate key={order.id} className="flex items-center gap-4">
                <Avatar
                  src={retailer?.logo_path ?? undefined}
                  alt={retailer?.name ?? "Lojista"}
                  fallback={initials}
                  size="md"
                  shape="square"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-semibold">
                    {order.order_number ?? "—"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {retailer?.name ?? "Lojista"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p className="font-heading text-sm font-semibold">
                  {formatCurrency(order.total_cents, order.currency)}
                </p>
                <OrderStatusBadge status={order.status} />
                <Link href={`/atelier/pedidos/${order.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="size-3.5" />}
                  >
                    Ver
                  </Button>
                </Link>
              </Plate>
            );
          })}
        </div>
      )}
    </div>
  );
}
