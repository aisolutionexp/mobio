import Link from "next/link";

import { Masthead } from "@/components/editorial/masthead";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listRetailerQuotes } from "@/lib/actions/quotes-retailer";
import { RetailerQuoteCard } from "@/components/domain/quotes/retailer-quote-card";

const STATUS_FILTERS = [
  { value: "", label: "Todas" },
  { value: "sent", label: "Pendentes" },
  { value: "accepted", label: "Aceitas" },
  { value: "rejected", label: "Recusadas" },
];

export default async function RetailerQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status ?? "";
  const page = Math.max(0, parseInt(params.page ?? "0", 10) || 0);

  const quotes = await listRetailerQuotes({
    status: activeStatus || undefined,
    page,
  });

  function buildUrl(status: string, p = 0) {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (p > 0) sp.set("page", String(p));
    const qs = sp.toString();
    return `/lojista/pedidos/quotes${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <Masthead
        title="Cotações recebidas"
        description="Cotações enviadas pelas fábricas para sua loja"
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/lojista/pedidos" />}
          >
            Ver pedidos
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

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {activeStatus
              ? "Nenhuma cotação encontrada com este filtro."
              : "Você ainda não recebeu nenhuma cotação."}
          </p>
          {activeStatus && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/lojista/pedidos/quotes" />}
            >
              Limpar filtro
            </Button>
          )}
        </div>
      ) : (
        <>
          <Eyebrow as="p" withRule>
            {quotes.length} cotaç{quotes.length === 1 ? "ão" : "ões"}
          </Eyebrow>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quotes.map((quote) => (
              <RetailerQuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        </>
      )}

      {(page > 0 || quotes.length === 50) && (
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
          {quotes.length === 50 && (
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
