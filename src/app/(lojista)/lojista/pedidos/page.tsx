import Link from "next/link";

import { Masthead } from "@/components/editorial/masthead";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listRetailerOrders } from "@/lib/actions/orders-retailer";
import { RetailerOrderCard } from "@/components/domain/orders/retailer-order-card";

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Em produção" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export default async function RetailerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status ?? "";
  const page = Math.max(0, parseInt(params.page ?? "0", 10) || 0);

  const orders = await listRetailerOrders({
    status: activeStatus || undefined,
    page,
  });

  function buildUrl(status: string, p = 0) {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (p > 0) sp.set("page", String(p));
    const qs = sp.toString();
    return `/lojista/pedidos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <Masthead
        title="Pedidos"
        description="Acompanhe seus pedidos com as fábricas"
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/lojista/pedidos/quotes" />}
          >
            Ver cotações
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Badge
            key={filter.value}
            variant={activeStatus === filter.value ? "accent" : "outline"}
            size="lg"
            className="cursor-pointer"
          >
            <Link href={buildUrl(filter.value)}>{filter.label}</Link>
          </Badge>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {activeStatus
              ? "Nenhum pedido encontrado com este filtro."
              : "Você ainda não tem nenhum pedido."}
          </p>
          {activeStatus && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/lojista/pedidos" />}
            >
              Limpar filtro
            </Button>
          )}
        </div>
      ) : (
        <>
          <Eyebrow as="p" withRule>
            {orders.length} pedido{orders.length !== 1 ? "s" : ""}
          </Eyebrow>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <RetailerOrderCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}

      {(page > 0 || orders.length === 50) && (
        <div className="flex items-center justify-center gap-4 pt-6">
          {page > 0 && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={buildUrl(activeStatus, page - 1)} />}
            >
              Anterior
            </Button>
          )}
          <span className="text-muted-foreground text-sm">
            Página {page + 1}
          </span>
          {orders.length === 50 && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={buildUrl(activeStatus, page + 1)} />}
            >
              Próxima
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
