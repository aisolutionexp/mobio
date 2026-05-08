import Image from "next/image";
import Link from "next/link";

import type {
  PublicLinesheetData,
  PublicLinesheetItem,
} from "@/lib/actions/linesheet-public";

const PRICING_VARIANT_LABELS: Record<string, string> = {
  retailer: "Atacado",
  msrp: "Varejo sugerido",
  custom: "Personalizado",
};

function resolvePrice(
  variant: string,
  item: PublicLinesheetItem,
): number | null {
  if (item.customPrice != null) return item.customPrice;
  switch (variant) {
    case "retailer":
      return item.product.wholesalePrice;
    case "msrp":
      return item.product.msrp;
    case "custom":
      return item.customPrice;
    default:
      return item.product.wholesalePrice;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function PublicLinesheetView({ data }: { data: PublicLinesheetData }) {
  const variantLabel =
    PRICING_VARIANT_LABELS[data.pricingVariant] ?? data.pricingVariant;

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">
            MOBIO
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {data.name}
          </h1>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span>{data.factoryName}</span>
            <span className="text-border">|</span>
            <span>
              {data.items.length}{" "}
              {data.items.length === 1 ? "produto" : "produtos"}
            </span>
            <span className="text-border">|</span>
            <span className="bg-muted rounded px-2 py-0.5 text-xs font-medium">
              {variantLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {data.items.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">
            Este linesheet não possui produtos.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => {
              const price = resolvePrice(data.pricingVariant, item);
              const imageUrl = item.product.images[0] ?? null;

              return (
                <div
                  key={item.id}
                  className="border-border overflow-hidden rounded-lg border"
                >
                  <div className="bg-muted relative aspect-[4/5]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-muted-foreground text-sm">
                          Sem imagem
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-sm font-semibold">
                      {item.product.name}
                    </h3>
                    {item.product.reference && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Ref: {item.product.reference}
                      </p>
                    )}
                    {price != null && (
                      <p className="mt-1 text-sm font-bold">
                        {formatCurrency(price)}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-muted-foreground mt-1 text-xs italic">
                        {item.note}
                      </p>
                    )}
                    {item.product.minOrderQty != null &&
                      item.product.minOrderQty > 0 && (
                        <p className="text-muted-foreground mt-1 text-[11px]">
                          Pedido mín: {item.product.minOrderQty} un.
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-border border-t py-8 text-center">
        <p className="text-muted-foreground text-xs">
          Powered by{" "}
          <Link href="/" className="font-medium underline underline-offset-4">
            MOBIO
          </Link>
        </p>
        <p className="text-muted-foreground/60 mt-1 text-[10px]">
          Plataforma de moda B2B
        </p>
      </footer>
    </div>
  );
}
