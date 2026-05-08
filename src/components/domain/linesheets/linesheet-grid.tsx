"use client";

import * as React from "react";
import { toast } from "sonner";
import { Package } from "lucide-react";

import { reorderLinesheetItems } from "@/lib/actions/linesheets";
import {
  LinesheetItemCard,
  type LinesheetItemData,
} from "@/components/domain/linesheets/linesheet-item-card";

export function LinesheetGrid({
  linesheetId,
  initialItems,
  pricingVariant,
}: {
  linesheetId: string;
  initialItems: LinesheetItemData[];
  pricingVariant: string;
}) {
  const itemsKey = initialItems.map((i) => i.id).join(",");

  return (
    <LinesheetGridInner
      key={itemsKey}
      linesheetId={linesheetId}
      initialItems={initialItems}
      pricingVariant={pricingVariant}
    />
  );
}

function LinesheetGridInner({
  linesheetId,
  initialItems,
  pricingVariant,
}: {
  linesheetId: string;
  initialItems: LinesheetItemData[];
  pricingVariant: string;
}) {
  const [items, setItems] = React.useState(initialItems);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleDragStart(index: number) {
    return (e: React.DragEvent) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    };
  }

  function handleDragOver(index: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    };
  }

  function handleDrop(index: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) {
        setDragIndex(null);
        setDragOverIndex(null);
        return;
      }

      const updated = [...items];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);

      setItems(updated);
      setDragIndex(null);
      setDragOverIndex(null);

      const ordering = updated.map((item, i) => ({
        id: item.id,
        position: i + 1,
      }));

      startTransition(async () => {
        const result = await reorderLinesheetItems(linesheetId, ordering);
        if (!result.success) {
          toast.error(result.error);
          setItems(initialItems);
        }
      });
    };
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Package className="text-muted-foreground size-10" />
        <p className="text-muted-foreground max-w-xs text-sm">
          Adicione produtos a este linesheet ou importe de um board
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${isPending ? "opacity-70" : ""}`}
    >
      {items.map((item, index) => (
        <LinesheetItemCard
          key={item.id}
          item={item}
          pricingVariant={pricingVariant}
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDrop={handleDrop(index)}
          onDragEnd={handleDragEnd}
          isDragOver={dragOverIndex === index}
        />
      ))}
    </div>
  );
}
