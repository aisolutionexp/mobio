"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuoteItemRowProps {
  index: number;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  onQuantityChange: (qty: number) => void;
  onPriceChange: (cents: number) => void;
  onRemove: () => void;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function QuoteItemRow({
  index,
  productName,
  quantity,
  unitPriceCents,
  onQuantityChange,
  onPriceChange,
  onRemove,
}: QuoteItemRowProps) {
  return (
    <div className="border-border flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{productName}</p>
        <p className="text-muted-foreground text-xs">
          Subtotal: {formatCurrency(quantity * unitPriceCents)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value) || 1)}
          className="w-20 text-center"
          aria-label={`Quantidade item ${index + 1}`}
        />
        <Input
          type="number"
          min={0.01}
          step={0.01}
          value={(unitPriceCents / 100).toFixed(2)}
          onChange={(e) =>
            onPriceChange(Math.round(Number(e.target.value) * 100) || 1)
          }
          className="w-28"
          aria-label={`Preço unitário item ${index + 1}`}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Remover ${productName}`}
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      </div>
    </div>
  );
}
