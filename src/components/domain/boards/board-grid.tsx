"use client";

import * as React from "react";
import { toast } from "sonner";
import { Package } from "lucide-react";

import { reorderBoardItems } from "@/lib/actions/boards";
import {
  BoardItemCard,
  type BoardItemData,
} from "@/components/domain/boards/board-item-card";

export function BoardGrid({
  boardId,
  initialItems,
}: {
  boardId: string;
  initialItems: BoardItemData[];
}) {
  const itemsKey = initialItems.map((i) => i.id).join(",");

  return (
    <BoardGridInner
      key={itemsKey}
      boardId={boardId}
      initialItems={initialItems}
    />
  );
}

function BoardGridInner({
  boardId,
  initialItems,
}: {
  boardId: string;
  initialItems: BoardItemData[];
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
        const result = await reorderBoardItems(boardId, ordering);
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
          Adicione produtos a este board navegando nos ateliers
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${isPending ? "opacity-70" : ""}`}
    >
      {items.map((item, index) => (
        <BoardItemCard
          key={item.id}
          item={item}
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
