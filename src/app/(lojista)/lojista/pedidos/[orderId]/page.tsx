import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Plate } from "@/components/editorial/plate";
import { OrderStatusBadge } from "@/components/domain/orders/order-status-badge";
import { OrderStatusTimelineRealtime } from "@/components/domain/orders/order-status-timeline-realtime";
import { CancelOrderButton } from "@/components/domain/orders/cancel-order-button";
import { PaymentScheduleDisplay } from "@/components/domain/payments/payment-schedule-display";
import { getRetailerOrder } from "@/lib/actions/orders-retailer";
import { getPaymentScheduleForOrder } from "@/lib/actions/payments";
import type { StatusHistoryEntry } from "@/components/domain/orders/order-status-timeline";

function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function RetailerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  let order;
  try {
    order = await getRetailerOrder(orderId);
  } catch {
    notFound();
  }

  if (!order) notFound();

  const supabase = await createClient();
  const { data: canCancel } = await supabase.rpc("fn_can_cancel_order", {
    p_order_id: orderId,
  });

  let paymentSchedules: Awaited<ReturnType<typeof getPaymentScheduleForOrder>> =
    [];
  try {
    paymentSchedules = await getPaymentScheduleForOrder(orderId);
  } catch {}

  const factory = order.factories;
  const regionName = factory?.regions?.name;
  const items = order.order_items ?? [];
  const statusHistory = (order.order_status_history ??
    []) as StatusHistoryEntry[];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Navegação"
        className="text-muted-foreground flex items-center gap-1 text-sm"
      >
        <Link href="/lojista/pedidos" className="hover:text-foreground">
          Pedidos
        </Link>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <span className="text-foreground font-medium">
          {order.order_number ?? "Detalhe"}
        </span>
      </nav>

      {/* Header / Masthead */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {order.order_number ?? "Pedido"}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-3">
          {canCancel && <CancelOrderButton orderId={order.id} />}
          <span className="text-muted-foreground text-sm">
            Criado em {formatDate(order.created_at)}
          </span>
        </div>
      </div>

      {/* Factory */}
      <Plate eyebrow="Fábrica" title={factory?.name ?? "Fábrica"}>
        <div className="text-muted-foreground space-y-1 text-sm">
          {regionName && <p>Região: {regionName}</p>}
          {factory?.email && <p>Contato: {factory.email}</p>}
          {order.notes && <p className="text-foreground pt-2">{order.notes}</p>}
        </div>
      </Plate>

      {/* Items */}
      <Plate eyebrow="Itens do pedido">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left">
                <th className="pr-4 pb-2 font-medium">Produto</th>
                <th className="pr-4 pb-2 text-right font-medium">Qtd</th>
                <th className="pr-4 pb-2 text-right font-medium">
                  Preço unit.
                </th>
                <th className="pb-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const subtotal = item.quantity * item.unit_price_cents;
                return (
                  <tr
                    key={item.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <span className="font-medium">
                        {item.products?.name ?? "Produto"}
                      </span>
                      {item.products?.reference && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          Ref: {item.products.reference}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4 text-right">
                      {formatCurrency(item.unit_price_cents, order.currency)}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(subtotal, order.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-3 text-right font-medium">
                  Total
                </td>
                <td className="font-heading pt-3 text-right text-lg font-semibold">
                  {formatCurrency(order.total_cents, order.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Plate>

      {/* Timeline — Realtime */}
      <Plate eyebrow="Histórico de status">
        <OrderStatusTimelineRealtime
          orderId={order.id}
          initialHistory={statusHistory}
          initialStatus={order.status}
        />
      </Plate>

      {/* Pagamento */}
      <Plate eyebrow="Pagamento" title="Condições de pagamento">
        <PaymentScheduleDisplay
          schedules={paymentSchedules}
          currency={order.currency}
        />
      </Plate>
    </div>
  );
}
