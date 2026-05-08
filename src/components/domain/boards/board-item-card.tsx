"use client";

import * as React from "react";
import Image from "next/image";
import { GripVertical, X } from "lucide-react";
import { toast } from "sonner";

import { removeProductFromBoard } from "@/lib/actions/boards";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NoteInput } from "@/components/domain/boards/note-input";

export interface BoardItemData {
  id: string;
  position: number;
  note: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    wholesalePrice: number | null;
    retailPrice: number | null;
    reference: string | null;
    factoryName: string | null;
    factorySlug: string | null;
    coverUrl: string | null;
  } | null;
}

export function BoardItemCard({
  item,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragOver,
}: {
  item: BoardItemData;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragOver: boolean;
}) {
  const [removing, setRemoving] = React.useState(false);

  async function handleRemove() {
    setRemoving(true);
    const result = await removeProductFromBoard(item.id);
    if (!result.success) {
      toast.error(result.error);
      setRemoving(false);
    }
  }

  if (!item.product) return null;

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
        {item.product.wholesalePrice != null && (
          <p className="text-accent mt-1 text-sm font-semibold">
            {formatBRL(item.product.wholesalePrice)}
          </p>
        )}
        <div className="mt-1">
          <NoteInput boardItemId={item.id} initialNote={item.note} />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleRemove}
        disabled={removing}
        aria-label="Remover do board"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
