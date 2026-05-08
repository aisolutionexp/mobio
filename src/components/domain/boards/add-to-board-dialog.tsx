"use client";

import * as React from "react";
import { LayoutGrid, Plus, Check } from "lucide-react";
import { toast } from "sonner";

import { addProductToBoard } from "@/lib/actions/boards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BoardOption {
  id: string;
  name: string;
  itemCount: number;
}

export function AddToBoardDialog({
  productId,
  boards,
}: {
  productId: string;
  boards: BoardOption[];
}) {
  const [open, setOpen] = React.useState(false);
  const [addingTo, setAddingTo] = React.useState<string | null>(null);
  const [addedTo, setAddedTo] = React.useState<Set<string>>(new Set());

  async function handleAdd(boardId: string) {
    setAddingTo(boardId);
    const result = await addProductToBoard(boardId, productId);
    setAddingTo(null);

    if (result.success) {
      setAddedTo((prev) => new Set(prev).add(boardId));
      toast.success("Produto adicionado ao board");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LayoutGrid
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Adicionar ao board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar ao board</DialogTitle>
          <DialogDescription>
            Selecione um board para adicionar este produto
          </DialogDescription>
        </DialogHeader>

        {boards.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              Você ainda não tem boards. Crie um em Boards.
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {boards.map((board) => {
              const added = addedTo.has(board.id);
              const loading = addingTo === board.id;

              return (
                <button
                  key={board.id}
                  type="button"
                  disabled={added || loading}
                  onClick={() => handleAdd(board.id)}
                  className="hover:bg-muted flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium">{board.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {board.itemCount}{" "}
                      {board.itemCount === 1 ? "produto" : "produtos"}
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
