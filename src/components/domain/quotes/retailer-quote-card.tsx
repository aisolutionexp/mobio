import Link from "next/link";
import { Factory, Package, Calendar } from "lucide-react";

import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/domain/quotes/quote-status-badge";

function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatCountdown(validUntil: string | null): string | null {
  if (!validUntil) return null;
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return "Expirada";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 1) return `${days} dias restantes`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h restantes`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}min restantes`;
}

type RetailerQuoteCardProps = {
  quote: {
    id: string;
    status: string;
    total_cents: number;
    currency: string;
    valid_until: string | null;
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

export function RetailerQuoteCard({ quote }: RetailerQuoteCardProps) {
  const countdown = formatCountdown(quote.valid_until);
  const regionName = quote.factories?.regions?.name;

  return (
    <Plate className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Factory
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
          <span className="truncate font-medium">
            {quote.factories?.name ?? "Fábrica"}
          </span>
          {regionName && (
            <Badge variant="outline" size="sm">
              {regionName}
            </Badge>
          )}
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <span className="font-heading text-foreground text-lg font-semibold">
          {formatCurrency(quote.total_cents, quote.currency)}
        </span>
        {countdown && (
          <span className="flex items-center gap-1">
            <Calendar aria-hidden="true" className="size-3.5" />
            {countdown}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/lojista/pedidos/quotes/${quote.id}`} />}
        >
          <Package
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Ver detalhes
        </Button>
      </div>
    </Plate>
  );
}
