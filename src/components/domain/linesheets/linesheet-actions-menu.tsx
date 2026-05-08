"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { updateLinesheet, deleteLinesheet } from "@/lib/actions/linesheets";
import { Button } from "@/components/ui/button";

export function LinesheetActionsMenu({
  linesheetId,
  linesheetName,
}: {
  linesheetId: string;
  linesheetName: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(linesheetName);
  const [deleting, setDeleting] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleRename() {
    if (!newName.trim() || newName.trim() === linesheetName) {
      setRenaming(false);
      return;
    }
    const result = await updateLinesheet(linesheetId, {
      name: newName.trim(),
    });
    if (result.success) {
      toast.success("Linesheet renomeado");
      setRenaming(false);
      setMenuOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Tem certeza que deseja excluir este linesheet? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }
    setDeleting(true);
    const result = await deleteLinesheet(linesheetId);
    if (result.success) {
      toast.success("Linesheet excluído");
      router.push("/lojista/linesheet");
    } else {
      toast.error(result.error);
      setDeleting(false);
    }
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="border-border bg-card rounded-md border px-2 py-1 text-sm"
          autoFocus
          maxLength={100}
        />
        <Button variant="accent" size="sm" onClick={handleRename}>
          Salvar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRenaming(false);
            setNewName(linesheetName);
          }}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Ações do linesheet"
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {menuOpen && (
        <div className="bg-card border-border absolute right-0 z-40 mt-1 w-48 rounded-lg border py-1 shadow-sm">
          <button
            type="button"
            className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
            onClick={() => {
              setRenaming(true);
              setMenuOpen(false);
            }}
          >
            <Pencil className="size-3.5" />
            Renomear
          </button>
          <button
            type="button"
            className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="size-3.5" />
            Excluir linesheet
          </button>
        </div>
      )}
    </div>
  );
}
