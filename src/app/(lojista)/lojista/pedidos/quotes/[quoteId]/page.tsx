import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { QuoteStatusBadge } from "@/components/domain/quotes/quote-status-badge";
import { RetailerQuoteActions } from "@/components/domain/quotes/retailer-quote-actions";
import { RetailerQuoteChatWrapper } from "@/components/domain/quotes/retailer-quote-chat-wrapper";
import { OpenConversationLink } from "@/components/domain/messaging/open-conversation-link";
import {
  getRetailerQuoteWithItems,
  listRetailerQuoteMessages,
} from "@/lib/actions/quotes-retailer";

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

export default async function RetailerQuoteDetailPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { quoteId } = await params;

  let quote;
  try {
    quote = await getRetailerQuoteWithItems(quoteId);
  } catch {
    notFound();
  }

  if (!quote) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = quote.quote_items ?? [];
  const factory = quote.factories;
  const regionName = factory?.regions?.name;

  let chatMessages: Awaited<ReturnType<typeof listRetailerQuoteMessages>> = [];
  try {
    chatMessages = await listRetailerQuoteMessages(quoteId);
  } catch {}

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
        <Link href="/lojista/pedidos/quotes" className="hover:text-foreground">
          Cotações
        </Link>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <span className="text-foreground font-medium">Detalhe</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Cotação
          </h1>
          <QuoteStatusBadge status={quote.status} />
        </div>
        <div className="flex items-center gap-3">
          {factory && (
            <OpenConversationLink
              factoryId={quote.factory_id}
              retailerId={quote.retailer_id}
              contextType="quote"
              contextId={quote.id}
              shellPrefix="lojista"
            />
          )}
          <span className="text-muted-foreground text-sm">
            Recebida em {formatDate(quote.created_at)}
          </span>
        </div>
      </div>

      {/* Factory info */}
      <Plate eyebrow="Da fábrica" title={factory?.name ?? "Fábrica"}>
        <div className="text-muted-foreground space-y-1 text-sm">
          {regionName && <p>Região: {regionName}</p>}
          {factory?.email && <p>Contato: {factory.email}</p>}
          {quote.valid_until && (
            <p>Válida até: {formatDate(quote.valid_until)}</p>
          )}
          {quote.notes && <p className="text-foreground pt-2">{quote.notes}</p>}
        </div>
      </Plate>

      {/* Items */}
      <Plate eyebrow="Itens da cotação">
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
                      {formatCurrency(item.unit_price_cents, quote.currency)}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(subtotal, quote.currency)}
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
                  {formatCurrency(quote.total_cents, quote.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Plate>

      {/* Chat */}
      {user && (
        <Plate eyebrow="Conversa" title="Chat da cotação">
          <RetailerQuoteChatWrapper
            quoteId={quote.id}
            currentUserId={user.id}
            initialMessages={chatMessages}
          />
        </Plate>
      )}

      {/* Actions */}
      <Plate eyebrow="Ações">
        <RetailerQuoteActions quoteId={quote.id} status={quote.status} />
        {quote.status !== "sent" && (
          <p className="text-muted-foreground text-sm">
            {quote.status === "accepted" &&
              "Esta cotação já foi aceita e gerou um pedido."}
            {quote.status === "rejected" && "Esta cotação foi recusada."}
            {quote.status === "expired" && "Esta cotação expirou."}
          </p>
        )}
      </Plate>
    </div>
  );
}
