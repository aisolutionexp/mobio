"use client";

import * as React from "react";
import { Search, Plus, Check } from "lucide-react";
import { toast } from "sonner";

import { addProductToLinesheet } from "@/lib/actions/linesheets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ProductOption {
  id: string;
  name: string;
  reference: string | null;
  factoryName: string | null;
}

export function AddProductToLinesheetDialog({
  linesheetId,
  products,
  existingProductIds,
}: {
  linesheetId: string;
  products: ProductOption[];
  existingProductIds: Set<string>;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [addingTo, setAddingTo] = React.useState<string | null>(null);
  const [addedTo, setAddedTo] = React.useState<Set<string>>(
    new Set(existingProductIds),
  );

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.reference?.toLowerCase().includes(q) ?? false) ||
      (p.factoryName?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleAdd(productId: string) {
    setAddingTo(productId);
    const result = await addProductToLinesheet(linesheetId, productId);
    setAddingTo(null);

    if (result.success) {
      setAddedTo((prev) => new Set(prev).add(productId));
      toast.success("Produto adicionado ao linesheet");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Adicionar produtos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar produtos</DialogTitle>
          <DialogDescription>
            Busque e selecione produtos para adicionar ao linesheet
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            placeholder="Buscar por nome, referência ou atelier..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              {search
                ? "Nenhum produto encontrado"
                : "Nenhum produto disponível"}
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {filtered.map((product) => {
              const added = addedTo.has(product.id);
              const loading = addingTo === product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={added || loading}
                  onClick={() => handleAdd(product.id)}
                  className="hover:bg-muted flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {[product.factoryName, product.reference]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {added ? (
                    <Check className="text-accent size-4" />
                  ) : loading ? (
                    <Plus className="text-muted-foreground size-4 animate-spin" />
                  ) : (
                    <Plus className="text-muted-foreground size-4" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
