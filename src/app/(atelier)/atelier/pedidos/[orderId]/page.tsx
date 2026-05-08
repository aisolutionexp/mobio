import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getFactoryOrder } from "@/lib/actions/orders";
import { getPaymentScheduleForOrder } from "@/lib/actions/payments";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Avatar } from "@/components/ui/avatar";
import { OrderStatusBadge } from "@/components/domain/orders/order-status-badge";
import { OrderStatusSelect } from "@/components/domain/orders/order-status-select";
import { OrderStatusTimelineRealtime } from "@/components/domain/orders/order-status-timeline-realtime";
import { PaymentScheduleDisplay } from "@/components/domain/payments/payment-schedule-display";
import { RecordPaymentDialog } from "@/components/domain/payments/record-payment-dialog";
import { CreatePaymentScheduleForm } from "@/components/domain/payments/create-payment-schedule-form";
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  let order;
  try {
    order = await getFactoryOrder(orderId);
  } catch {
    notFound();
  }

  const retailer = order.retailers as unknown as {
    id: string;
    name: string;
    slug: string;
    logo_path: string | null;
    email: string | null;
  } | null;

  const orderItems = (order.order_items ?? []) as unknown as Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price_cents: number;
    products: { id: string; name: string; reference: string | null } | null;
  }>;

  const statusHistory = (order.order_status_history ??
    []) as unknown as StatusHistoryEntry[];

  let paymentSchedules: Awaited<ReturnType<typeof getPaymentScheduleForOrder>> =
    [];
  try {
    paymentSchedules = await getPaymentScheduleForOrder(orderId);
  } catch {}

  const initials =
    retailer?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?";

  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0,
  );

  const isCancelled = order.status === "cancelled";
  const cancelEntry = isCancelled
    ? [...statusHistory]
        .filter((e) => e.to_status === "cancelled")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Navegação"
        className="text-muted-foreground flex items-center gap-1 text-sm"
      >
        <Link href="/atelier/pedidos" className="hover:text-foreground">
          Pedidos
        </Link>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <span className="text-foreground font-medium">
          {order.order_number ?? "Detalhe"}
        </span>
      </nav>

      {/* Masthead */}
      <Masthead
        title={order.order_number ?? `Pedido #${orderId.slice(0, 8)}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Cliente */}
        <Plate eyebrow="Cliente" title={retailer?.name ?? "Lojista"}>
          <div className="flex items-center gap-4">
            <Avatar
              src={retailer?.logo_path ?? undefined}
              alt={retailer?.name ?? "Lojista"}
              fallback={initials}
              size="lg"
              shape="square"
            />
            <div>
              <p className="font-heading text-base font-semibold">
                {retailer?.name}
              </p>
              {retailer?.email && (
                <p className="text-muted-foreground text-sm">
                  {retailer.email}
                </p>
              )}
            </div>
          </div>
        </Plate>

        {/* Status action */}
        {!isCancelled && order.status !== "delivered" && (
          <Plate eyebrow="Status" title="Alterar status">
            <OrderStatusSelect
              orderId={order.id}
              currentStatus={order.status}
            />
          </Plate>
        )}
      </div>

      {/* Items */}
      <Plate eyebrow="Itens" title="Produtos do pedido">
        {orderItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum item registrado
          </p>
        ) : (
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
                {orderItems.map((item) => {
                  const sub = item.quantity * item.unit_price_cents;
                  return (
                    <tr
                      key={item.id}
                      className="border-border border-b last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-medium">
                          {item.products?.name ?? "Produto removido"}
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
                        {formatCurrency(sub, order.currency)}
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
        )}
      </Plate>

      {/* Timeline — Realtime */}
      <Plate eyebrow="Atividade" title="Timeline de status">
        <OrderStatusTimelineRealtime
          orderId={order.id}
          initialHistory={statusHistory}
          initialStatus={order.status}
          showStatusBadge
        />
      </Plate>

      {/* Pagamento */}
      <Plate eyebrow="Pagamento" title="Condições de pagamento">
        {paymentSchedules.length > 0 ? (
          <div className="space-y-4">
            <PaymentScheduleDisplay
              schedules={paymentSchedules}
              currency={order.currency}
            />
            {paymentSchedules[0].status !== "cancelled" &&
              paymentSchedules[0].status !== "paid" && (
                <RecordPaymentDialog
                  scheduleId={paymentSchedules[0].id}
                  maxCents={paymentSchedules[0].total_cents}
                  currency={order.currency}
                />
              )}
          </div>
        ) : (
          <CreatePaymentScheduleForm orderId={order.id} />
        )}
      </Plate>

      {/* Cancelamento info */}
      {isCancelled && cancelEntry && (
        <Plate eyebrow="Cancelamento" accent>
          <div className="space-y-1 text-sm">
            <p className="text-destructive font-medium">Pedido cancelado</p>
            <p className="text-muted-foreground">
              Em {formatDate(cancelEntry.created_at)}
            </p>
            {cancelEntry.notes && (
              <p className="text-muted-foreground">
                Motivo: {cancelEntry.notes}
              </p>
            )}
          </div>
        </Plate>
      )}
    </div>
  );
}
