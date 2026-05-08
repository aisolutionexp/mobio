import { notFound } from "next/navigation";

import { getFactoryOrder } from "@/lib/actions/orders";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Avatar } from "@/components/ui/avatar";
import { OrderStatusBadge } from "@/components/domain/orders/order-status-badge";
import { OrderStatusSelect } from "@/components/domain/orders/order-status-select";

function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
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

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Pedidos"
        title={order.order_number ?? `Pedido #${orderId.slice(0, 8)}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        <Plate eyebrow="Status" title="Alterar status">
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </Plate>
      </div>

      <Plate eyebrow="Itens" title="Produtos do pedido">
        {orderItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum item registrado
          </p>
        ) : (
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="border-border flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.products?.name ?? "Produto removido"}
                  </p>
                  {item.products?.reference && (
                    <p className="text-muted-foreground text-xs">
                      Ref: {item.products.reference}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {item.quantity}x{" "}
                    {formatCurrency(item.unit_price_cents, order.currency)}
                  </p>
                  <p className="font-heading text-sm font-semibold">
                    {formatCurrency(
                      item.quantity * item.unit_price_cents,
                      order.currency,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Plate>

      <Plate eyebrow="Financeiro" title="Resumo">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotalCents, order.currency)}</span>
          </div>
          <div className="border-border flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="font-heading">
              {formatCurrency(order.total_cents, order.currency)}
            </span>
          </div>
        </div>
      </Plate>

      <Plate eyebrow="Atividade" title="Timeline">
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-sm">Timeline de atividades em breve</p>
        </div>
      </Plate>
    </div>
  );
}
