"use client";

import { Menu } from "@base-ui/react/menu";
import { MoreVertical, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

import { cancelInvite, resendInvite } from "@/lib/actions/team";

export function InviteActions({
  inviteId,
}: {
  inviteId: string;
  isExpired?: boolean;
}) {
  async function handleResend() {
    const result = await resendInvite(inviteId);

    if (result.success) {
      await navigator.clipboard.writeText(result.data.inviteUrl);
      toast.success("Convite reenviado. Link copiado.");
    } else {
      toast.error(result.error);
    }
  }

  async function handleCancel() {
    const result = await cancelInvite(inviteId);

    if (result.success) {
      toast.success("Convite cancelado");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
        aria-label="Abrir menu de ações do convite"
      >
        <MoreVertical className="size-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} className="z-50">
          <Menu.Popup className="border-border bg-popover min-w-[160px] rounded-md border p-1 shadow-sm">
            <Menu.Item
              className="hover:bg-accent/10 flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
              onClick={handleResend}
            >
              <RefreshCw className="size-4" />
              Reenviar
            </Menu.Item>
            <Menu.Item
              className="text-destructive hover:bg-destructive/10 flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
              onClick={handleCancel}
            >
              <XCircle className="size-4" />
              Cancelar convite
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
