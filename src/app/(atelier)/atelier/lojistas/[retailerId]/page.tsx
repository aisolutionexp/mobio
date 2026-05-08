import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  FileText,
  Clock,
  Plus,
  DollarSign,
  Package,
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { listFactoryOrders } from "@/lib/actions/orders";
import { listQuotesForRetailer } from "@/lib/actions/quotes";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/domain/orders/order-status-badge";
import { QuoteStatusBadge } from "@/components/domain/quotes/quote-status-badge";

function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function RetailerDetailPage({
  params,
}: {
  params: Promise<{ retailerId: string }>;
}) {
  const { retailerId } = await params;
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data: authorization, error } = await supabase
    .from("authorized_retailers")
    .select("*, retailers(id, name, slug, logo_path, email)")
    .eq("factory_id", tenantId)
    .eq("retailer_id", retailerId)
    .single();

  if (error || !authorization) notFound();

  const retailer = authorization.retailers as unknown as {
    id: string;
    name: string;
    slug: string;
    logo_path: string | null;
    email: string | null;
  } | null;

  const [orders, quotes] = await Promise.all([
    listFactoryOrders({ retailer_id: retailerId }),
    listQuotesForRetailer(retailerId),
  ]);

  const totalOrdersCents = orders.reduce((s, o) => s + o.total_cents, 0);
  const pendingQuotes = quotes.filter(
    (q) => q.status === "sent" || q.status === "draft",
  );
  const lastOrder = orders[0];

  const initials =
    retailer?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Lojistas"
        title={retailer?.name ?? "Lojista"}
        description={retailer?.email ?? undefined}
        actions={
          <Badge
            variant={
              authorization.status === "active" ? "success" : "destructive"
            }
            size="lg"
            dot
          >
            {authorization.status === "active" ? "Autorizado" : "Revogado"}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Plate>
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-md">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Pedidos</p>
              <p className="font-heading text-xl font-bold">{orders.length}</p>
            </div>
          </div>
        </Plate>
        <Plate>
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-md">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Valor total</p>
              <p className="font-heading text-xl font-bold">
                {formatCurrency(totalOrdersCents)}
              </p>
            </div>
          </div>
        </Plate>
        <Plate>
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-md">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Último pedido</p>
              <p className="font-heading text-sm font-bold">
                {lastOrder
                  ? new Date(lastOrder.created_at).toLocaleDateString("pt-BR")
                  : "—"}
              </p>
            </div>
          </div>
        </Plate>
        <Plate>
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-md">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                Cotações pendentes
              </p>
              <p className="font-heading text-xl font-bold">
                {pendingQuotes.length}
              </p>
            </div>
          </div>
        </Plate>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders" icon={<ShoppingBag className="size-4" />}>
            Pedidos ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="quotes" icon={<FileText className="size-4" />}>
            Cotações ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="activity" icon={<Clock className="size-4" />}>
            Atividade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <ShoppingBag className="text-muted-foreground/50 size-10" />
              <p className="text-sm">Nenhum pedido deste lojista</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order.id} href={`/atelier/pedidos/${order.id}`}>
                  <Plate className="group hover:border-accent/50 flex items-center gap-4 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold">
                        {order.order_number ?? "—"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <p className="font-heading text-sm font-semibold">
                      {formatCurrency(order.total_cents, order.currency)}
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </Plate>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quotes">
          <div className="mb-4 flex justify-end">
            <Link href={`/atelier/lojistas/${retailerId}/quote`}>
              <Button variant="accent" leftIcon={<Plus className="size-4" />}>
                Nova cotação
              </Button>
            </Link>
          </div>
          {quotes.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="text-muted-foreground/50 size-10" />
              <p className="text-sm">Nenhuma cotação para este lojista</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <Plate key={quote.id} className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold">
                      Cotação #{quote.id.slice(0, 8)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(quote.created_at).toLocaleDateString("pt-BR")}
                      {quote.valid_until && (
                        <>
                          {" · Válida até "}
                          {new Date(quote.valid_until).toLocaleDateString(
                            "pt-BR",
                          )}
                        </>
                      )}
                    </p>
                  </div>
                  <p className="font-heading text-sm font-semibold">
                    {formatCurrency(quote.total_cents, quote.currency)}
                  </p>
                  <QuoteStatusBadge status={quote.status} />
                </Plate>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
            <Clock className="text-muted-foreground/50 size-10" />
            <p className="text-sm">Timeline de atividades em breve</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
