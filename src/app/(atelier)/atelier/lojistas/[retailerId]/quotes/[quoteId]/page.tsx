import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { Plate } from "@/components/editorial/plate";
import { QuoteStatusBadge } from "@/components/domain/quotes/quote-status-badge";
import { FactoryQuoteChatWrapper } from "@/components/domain/quotes/factory-quote-chat-wrapper";
import { OpenConversationLink } from "@/components/domain/messaging/open-conversation-link";
import { listQuoteMessages } from "@/lib/actions/quotes";

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

export default async function FactoryQuoteDetailPage({
  params,
}: {
  params: Promise<{ retailerId: string; quoteId: string }>;
}) {
  const { retailerId, quoteId } = await params;
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select(
      "*, retailers(id, name), quote_items(id, product_id, quantity, unit_price_cents, products(id, name, reference))",
    )
    .eq("id", quoteId)
    .eq("factory_id", tenantId)
    .single();

  if (error || !quote) notFound();

  const items = quote.quote_items ?? [];

  let chatMessages: Awaited<ReturnType<typeof listQuoteMessages>> = [];
  try {
    chatMessages = await listQuoteMessages(quoteId);
  } catch {}

  const retailer = quote.retailers as unknown as {
    id: string;
    name: string;
  } | null;

  return (
    <div className="space-y-6">
      <nav
        aria-label="Navegação"
        className="text-muted-foreground flex items-center gap-1 text-sm"
      >
        <Link href="/atelier/lojistas" className="hover:text-foreground">
          Lojistas
        </Link>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <Link
          href={`/atelier/lojistas/${retailerId}`}
          className="hover:text-foreground"
        >
          {retailer?.name ?? "Lojista"}
        </Link>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <span className="text-foreground font-medium">Cotação</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Cotação #{quoteId.slice(0, 8)}
          </h1>
          <QuoteStatusBadge status={quote.status} />
        </div>
        {retailer && (
          <OpenConversationLink
            factoryId={tenantId}
            retailerId={retailer.id}
            contextType="quote"
            contextId={quote.id}
            shellPrefix="atelier"
          />
        )}
      </div>

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

      {user && (
        <Plate eyebrow="Conversa" title="Chat da cotação">
          <FactoryQuoteChatWrapper
            quoteId={quote.id}
            currentUserId={user.id}
            initialMessages={chatMessages}
          />
        </Plate>
      )}
    </div>
  );
}
