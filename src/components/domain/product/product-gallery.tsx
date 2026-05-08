"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = sorted[selectedIndex];

  if (sorted.length === 0) {
    return (
      <div className="bg-muted flex aspect-square items-center justify-center rounded-lg">
        <p className="text-muted-foreground text-sm">Sem imagens</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
        {selected && (
          <Image
            src={selected.url}
            alt={selected.altText ?? productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "border-border relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === selectedIndex && "border-accent",
              )}
              aria-label={`Ver imagem ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} - ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
