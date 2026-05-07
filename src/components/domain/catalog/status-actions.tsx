"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { MoreVertical, Send, Archive, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type StatusAction = "publish" | "archive" | "unarchive";

interface StatusActionsProps {
  currentStatus: string;
  onPublish: () => Promise<{ success: boolean; error?: string }>;
  onArchive: () => Promise<{ success: boolean; error?: string }>;
  onUnarchive?: () => Promise<{ success: boolean; error?: string }>;
  entityLabel: string;
}

const ACTION_CONFIG: Record<
  StatusAction,
  {
    label: string;
    icon: typeof Send;
    confirmTitle: string;
    confirmDescription: string;
    variant: "accent" | "destructive";
  }
> = {
  publish: {
    label: "Publicar",
    icon: Send,
    confirmTitle: "Publicar",
    confirmDescription: "ficará visível para lojistas.",
    variant: "accent",
  },
  archive: {
    label: "Arquivar",
    icon: Archive,
    confirmTitle: "Arquivar",
    confirmDescription: "não ficará mais visível.",
    variant: "destructive",
  },
  unarchive: {
    label: "Restaurar rascunho",
    icon: RotateCcw,
    confirmTitle: "Restaurar",
    confirmDescription: "voltará para rascunho.",
    variant: "accent",
  },
};

export function StatusActions({
  currentStatus,
  onPublish,
  onArchive,
  onUnarchive,
  entityLabel,
}: StatusActionsProps) {
  const [confirmAction, setConfirmAction] = React.useState<StatusAction | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);

  const availableActions: StatusAction[] = [];
  if (currentStatus === "draft") {
    availableActions.push("publish", "archive");
  } else if (currentStatus === "published") {
    availableActions.push("archive");
  } else if (currentStatus === "archived" && onUnarchive) {
    availableActions.push("unarchive");
  }

  if (availableActions.length === 0) return null;

  async function handleConfirm() {
    if (!confirmAction) return;
    setLoading(true);

    let result: { success: boolean; error?: string };
    if (confirmAction === "publish") result = await onPublish();
    else if (confirmAction === "archive") result = await onArchive();
    else result = await onUnarchive!();

    setLoading(false);

    if (result.success) {
      toast.success(
        `${entityLabel} ${ACTION_CONFIG[confirmAction].confirmTitle.toLowerCase()}${confirmAction === "publish" ? "o" : "o"} com sucesso`,
      );
      setConfirmAction(null);
    } else {
      toast.error(result.error ?? "Erro ao atualizar status");
    }
  }

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          className="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
          aria-label="Abrir menu de ações"
        >
          <MoreVertical className="size-4" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={4} className="z-50">
            <Menu.Popup className="border-border bg-popover min-w-[160px] rounded-md border p-1 shadow-sm">
              {availableActions.map((action) => {
                const config = ACTION_CONFIG[action];
                const ActionIcon = config.icon;
                return (
                  <Menu.Item
                    key={action}
                    className="hover:bg-accent/10 flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                    onClick={() => setConfirmAction(action)}
                  >
                    <ActionIcon className="size-4" />
                    {config.label}
                  </Menu.Item>
                );
              })}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Dialog.Root
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="bg-card border-border fixed top-1/2 left-1/2 z-60 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg">
            {confirmAction && (
              <>
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-heading text-lg font-semibold">
                    {ACTION_CONFIG[confirmAction].confirmTitle}{" "}
                    {entityLabel.toLowerCase()}
                  </Dialog.Title>
                  <Dialog.Close className="text-muted-foreground hover:text-foreground rounded-md p-1">
                    <X className="size-4" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="text-muted-foreground mt-2 text-sm">
                  Tem certeza? {entityLabel}{" "}
                  {ACTION_CONFIG[confirmAction].confirmDescription}
                </Dialog.Description>
                <div className="mt-6 flex justify-end gap-3">
                  <Dialog.Close
                    render={<Button variant="outline" type="button" />}
                  >
                    Cancelar
                  </Dialog.Close>
                  <Button
                    variant={ACTION_CONFIG[confirmAction].variant}
                    loading={loading}
                    onClick={handleConfirm}
                  >
                    {ACTION_CONFIG[confirmAction].label}
                  </Button>
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
