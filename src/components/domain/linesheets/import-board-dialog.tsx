"use client";

import * as React from "react";
import { LayoutGrid, Check, Download } from "lucide-react";
import { toast } from "sonner";

import { importBoardToLinesheet } from "@/lib/actions/linesheets";
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

export function ImportBoardDialog({
  linesheetId,
  boards,
}: {
  linesheetId: string;
  boards: BoardOption[];
}) {
  const [open, setOpen] = React.useState(false);
  const [importingFrom, setImportingFrom] = React.useState<string | null>(null);
  const [importedFrom, setImportedFrom] = React.useState<Set<string>>(
    new Set(),
  );

  async function handleImport(boardId: string) {
    setImportingFrom(boardId);
    const result = await importBoardToLinesheet(boardId, linesheetId);
    setImportingFrom(null);

    if (result.success) {
      setImportedFrom((prev) => new Set(prev).add(boardId));
      toast.success(
        `${result.data.imported} ${result.data.imported === 1 ? "produto importado" : "produtos importados"}`,
      );
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Importar de board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar de board</DialogTitle>
          <DialogDescription>
            Selecione um board para importar seus produtos
          </DialogDescription>
        </DialogHeader>

        {boards.length === 0 ? (
          <div className="py-6 text-center">
            <LayoutGrid className="text-muted-foreground mx-auto mb-3 size-8" />
            <p className="text-muted-foreground text-sm">
              Você ainda não tem boards. Crie um em Boards.
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {boards.map((board) => {
              const imported = importedFrom.has(board.id);
              const loading = importingFrom === board.id;

              return (
                <button
                  key={board.id}
                  type="button"
                  disabled={imported || loading}
                  onClick={() => handleImport(board.id)}
                  className="hover:bg-muted flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium">{board.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {board.itemCount}{" "}
                      {board.itemCount === 1 ? "produto" : "produtos"}
                    </p>
                  </div>
                  {imported ? (
                    <Check className="text-accent size-4" />
                  ) : loading ? (
                    <Download className="text-muted-foreground size-4 animate-spin" />
                  ) : (
                    <Download className="text-muted-foreground size-4" />
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
