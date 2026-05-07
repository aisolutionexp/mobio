"use client";

import * as React from "react";
import {
  Upload,
  X,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  uploadProductImage,
  deleteProductImage,
  setCoverImage,
  reorderProductImages,
} from "@/lib/actions/product-images";
import { cn } from "@/lib/utils";

type ProductImage = {
  id: string;
  path: string;
  alt_text: string | null;
  is_cover: boolean;
  sort_order: number;
};

export function ProductImageUploader({
  productId,
  images,
  signedUrls,
}: {
  productId: string;
  images: ProductImage[];
  signedUrls: Record<string, string>;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("product_id", productId);

      const result = await uploadProductImage(formData);
      if (result.success) {
        toast.success(`${file.name} enviada`);
      } else {
        toast.error(result.error);
      }
    }

    setUploading(false);
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId);
    const result = await deleteProductImage(imageId);
    if (result.success) {
      toast.success("Imagem removida");
    } else {
      toast.error(result.error);
    }
    setDeletingId(null);
  }

  async function handleSetCover(imageId: string) {
    const result = await setCoverImage(productId, imageId);
    if (result.success) {
      toast.success("Capa definida");
    } else {
      toast.error(result.error);
    }
  }

  async function handleMove(imageId: string, direction: "up" | "down") {
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === imageId);
    if (idx === -1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const tempOrder = sorted[idx].sort_order;
    sorted[idx] = { ...sorted[idx], sort_order: sorted[swapIdx].sort_order };
    sorted[swapIdx] = { ...sorted[swapIdx], sort_order: tempOrder };

    const result = await reorderProductImages({
      productId,
      ordering: sorted.map((i) => ({ id: i.id, sort_order: i.sort_order })),
    });

    if (!result.success) {
      toast.error(result.error);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-border hover:border-accent/50 hover:bg-muted/30 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 transition-colors",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        {uploading ? (
          <Loader2 className="text-muted-foreground mb-2 size-8 animate-spin" />
        ) : (
          <Upload className="text-muted-foreground mb-2 size-8" />
        )}
        <p className="text-sm font-medium">
          {uploading ? "Enviando..." : "Arraste fotos ou clique para enviar"}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          JPEG, PNG ou WebP — até 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((image, idx) => (
            <div
              key={image.id}
              className={cn(
                "group relative overflow-hidden rounded-lg border",
                image.is_cover && "ring-accent ring-2",
              )}
            >
              <div className="bg-muted relative aspect-square">
                {signedUrls[image.path] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={signedUrls[image.path]}
                    alt={image.alt_text ?? "Foto do produto"}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageIcon className="text-muted-foreground size-8" />
                  </div>
                )}

                {image.is_cover && (
                  <span className="bg-accent text-accent-foreground absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                    Capa
                  </span>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMove(image.id, "up")}
                    disabled={idx === 0}
                    className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                    aria-label="Mover imagem para cima"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(image.id, "down")}
                    disabled={idx === sorted.length - 1}
                    className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                    aria-label="Mover imagem para baixo"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  {!image.is_cover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(image.id)}
                      className="rounded p-1 text-white hover:bg-white/20"
                      aria-label="Definir como capa"
                    >
                      <Star className="size-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  className="rounded p-1 text-white hover:bg-red-500/70"
                  aria-label="Remover imagem"
                >
                  {deletingId === image.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <X className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !uploading && (
          <div className="flex flex-col items-center py-6 text-center">
            <AlertCircle className="text-muted-foreground mb-2 size-6" />
            <p className="text-muted-foreground text-sm">
              Nenhuma foto adicionada
            </p>
          </div>
        )
      )}
    </div>
  );
}
