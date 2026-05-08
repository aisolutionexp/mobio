"use client";

import * as React from "react";
import Image from "next/image";
import { GripVertical, X } from "lucide-react";
import { toast } from "sonner";

import { removeLinesheetItem } from "@/lib/actions/linesheets";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LinesheetNoteInput } from "@/components/domain/linesheets/linesheet-note-input";
import { CustomPriceInput } from "@/components/domain/linesheets/custom-price-input";

export interface LinesheetItemData {
  id: string;
  position: number;
  note: string | null;
  customPrice: number | null;
  product: {
    id: string;
    name: string;
    slug: string;
    wholesalePrice: number | null;
    retailPrice: number | null;
    msrp: number | null;
    reference: string | null;
    factoryName: string | null;
    factorySlug: string | null;
    coverUrl: string | null;
  } | null;
}

function getDisplayPrice(
  item: LinesheetItemData,
  pricingVariant: string,
): number | null {
  if (item.customPrice != null) return item.customPrice;
  if (!item.product) return null;
  switch (pricingVariant) {
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

export function LinesheetItemCard({
  item,
  pricingVariant,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragOver,
}: {
  item: LinesheetItemData;
  pricingVariant: string;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragOver: boolean;
}) {
  const [removing, setRemoving] = React.useState(false);

  async function handleRemove() {
    setRemoving(true);
    const result = await removeLinesheetItem(item.id);
    if (!result.success) {
      toast.error(result.error);
      setRemoving(false);
    }
  }

  if (!item.product) return null;

  const displayPrice = getDisplayPrice(item, pricingVariant);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`border-border bg-card group relative flex gap-3 rounded-lg border p-3 transition-colors ${
        isDragOver ? "border-accent bg-accent/5" : ""
      }`}
    >
      <div className="text-muted-foreground cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
        <GripVertical className="mt-1 size-4" />
      </div>

      <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md">
        {item.product.coverUrl ? (
          <Image
            src={item.product.coverUrl}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-muted-foreground text-xs">Sem foto</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-tight font-medium">{item.product.name}</p>
        {item.product.factoryName && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {item.product.factoryName}
          </p>
        )}
        {item.product.reference && (
          <p className="text-muted-foreground text-xs">
            REF: {item.product.reference}
          </p>
        )}

        {pricingVariant === "custom" ? (
          <div className="mt-1">
            <CustomPriceInput
              itemId={item.id}
              initialPrice={item.customPrice}
            />
          </div>
        ) : (
          displayPrice != null && (
            <p className="text-accent mt-1 text-sm font-semibold">
              {formatBRL(displayPrice)}
            </p>
          )
        )}

        <div className="mt-1">
          <LinesheetNoteInput itemId={item.id} initialNote={item.note} />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleRemove}
        disabled={removing}
        aria-label="Remover do linesheet"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
