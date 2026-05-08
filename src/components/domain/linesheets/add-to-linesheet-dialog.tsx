"use client";

import * as React from "react";
import { FileText, Plus, Check } from "lucide-react";
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

interface LinesheetOption {
  id: string;
  name: string;
  itemCount: number;
  pricingVariant: string;
}

const VARIANT_LABELS: Record<string, string> = {
  retailer: "Atacado",
  msrp: "Sugerido",
  custom: "Customizado",
};

export function AddToLinesheetDialog({
  productId,
  linesheets,
}: {
  productId: string;
  linesheets: LinesheetOption[];
}) {
  const [open, setOpen] = React.useState(false);
  const [addingTo, setAddingTo] = React.useState<string | null>(null);
  const [addedTo, setAddedTo] = React.useState<Set<string>>(new Set());

  async function handleAdd(linesheetId: string) {
    setAddingTo(linesheetId);
    const result = await addProductToLinesheet(linesheetId, productId);
    setAddingTo(null);

    if (result.success) {
      setAddedTo((prev) => new Set(prev).add(linesheetId));
      toast.success("Produto adicionado ao linesheet");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Adicionar a linesheet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar a linesheet</DialogTitle>
          <DialogDescription>
            Selecione um linesheet para adicionar este produto
          </DialogDescription>
        </DialogHeader>

        {linesheets.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              Você ainda não tem linesheets. Crie um em Linesheets.
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {linesheets.map((ls) => {
              const added = addedTo.has(ls.id);
              const loading = addingTo === ls.id;

              return (
                <button
                  key={ls.id}
                  type="button"
                  disabled={added || loading}
                  onClick={() => handleAdd(ls.id)}
                  className="hover:bg-muted flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium">{ls.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {ls.itemCount}{" "}
                      {ls.itemCount === 1 ? "produto" : "produtos"} ·{" "}
                      {VARIANT_LABELS[ls.pricingVariant] ?? ls.pricingVariant}
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
