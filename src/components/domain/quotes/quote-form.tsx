"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createQuote, sendQuote } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plate } from "@/components/editorial/plate";
import { QuoteItemRow } from "@/components/domain/quotes/quote-item-row";

interface Product {
  id: string;
  name: string;
  reference: string | null;
  wholesale_price: number | null;
  retail_price: number | null;
}

interface QuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
}

export function QuoteForm({
  retailerId,
  retailerName,
  products,
}: {
  retailerId: string;
  retailerName: string;
  products: Product[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<QuoteItem[]>([]);
  const [notes, setNotes] = React.useState("");
  const [validUntil, setValidUntil] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sendAfter, setSendAfter] = React.useState(false);

  const availableProducts = products.filter(
    (p) => !items.some((item) => item.product_id === p.id),
  );

  function handleAddProduct() {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    setItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price_cents: product.wholesale_price ?? 0,
      },
    ]);
    setSelectedProductId("");
  }

  function handleUpdateQuantity(index: number, qty: number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item)),
    );
  }

  function handleUpdatePrice(index: number, cents: number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, unit_price_cents: cents } : item,
      ),
    );
  }

  function handleRemove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalCents = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Adicione ao menos um item");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.set("retailer_id", retailerId);
    formData.set("valid_until", new Date(validUntil).toISOString());
    formData.set(
      "items",
      JSON.stringify(
        items.map(({ product_id, quantity, unit_price_cents }) => ({
          product_id,
          quantity,
          unit_price_cents,
        })),
      ),
    );
    if (notes) formData.set("notes", notes);

    const result = await createQuote(null, formData);

    if (!result.success) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    if (sendAfter) {
      const sendResult = await sendQuote(result.data.id);
      if (!sendResult.success) {
        toast.error(sendResult.error);
      } else {
        toast.success("Cotação criada e enviada");
      }
    } else {
      toast.success("Cotação salva como rascunho");
    }

    setSubmitting(false);
    router.push(`/atelier/lojistas/${retailerId}?tab=quotes`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Plate eyebrow="Validade" title="Configurações da cotação">
        <div className="space-y-4">
          <div>
            <label htmlFor="valid_until" className="text-sm font-medium">
              Válida até
            </label>
            <Input
              id="valid_until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="mt-1 w-48"
            />
          </div>
        </div>
      </Plate>

      <Plate eyebrow="Itens" title="Produtos da cotação">
        <div className="space-y-4">
          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((item, index) => (
                <QuoteItemRow
                  key={item.product_id}
                  index={index}
                  productName={item.product_name}
                  quantity={item.quantity}
                  unitPriceCents={item.unit_price_cents}
                  onQuantityChange={(qty) => handleUpdateQuantity(index, qty)}
                  onPriceChange={(cents) => handleUpdatePrice(index, cents)}
                  onRemove={() => handleRemove(index)}
                />
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                options={availableProducts.map((p) => ({
                  value: p.id,
                  label: `${p.name}${p.reference ? ` (${p.reference})` : ""}`,
                }))}
                value={selectedProductId}
                onValueChange={setSelectedProductId}
                placeholder="Selecione um produto..."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddProduct}
              disabled={!selectedProductId}
              leftIcon={<Plus className="size-4" />}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </Plate>

      <Plate eyebrow="Observações">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações opcionais..."
          rows={3}
          maxLength={2000}
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
        />
      </Plate>

      <Plate eyebrow="Resumo">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </span>
          <span className="font-heading text-xl font-bold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalCents / 100)}
          </span>
        </div>
      </Plate>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="submit"
          variant="outline"
          loading={submitting && !sendAfter}
          disabled={submitting}
          onClick={() => setSendAfter(false)}
        >
          Salvar rascunho
        </Button>
        <Button
          type="submit"
          variant="accent"
          loading={submitting && sendAfter}
          disabled={submitting}
          onClick={() => setSendAfter(true)}
        >
          Salvar e enviar
        </Button>
      </div>
    </form>
  );
}
