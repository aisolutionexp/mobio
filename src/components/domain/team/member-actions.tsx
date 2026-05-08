"use client";

import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { Dialog } from "@base-ui/react/dialog";
import { MoreVertical, Shield, UserMinus, X } from "lucide-react";
import { toast } from "sonner";

import { updateMemberRole, deactivateMember } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";

export function MemberActions({
  memberId,
  currentRole,
  isActive,
}: {
  memberId: string;
  currentRole: string;
  isActive: boolean;
}) {
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleToggleRole() {
    const newRole =
      currentRole === "atelier_owner" ? "atelier_member" : "atelier_owner";
    setLoading(true);
    const result = await updateMemberRole(memberId, newRole);
    setLoading(false);

    if (result.success) {
      toast.success("Papel atualizado");
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeactivate() {
    setLoading(true);
    const result = await deactivateMember(memberId);
    setLoading(false);

    if (result.success) {
      toast.success("Membro desativado");
      setConfirmDeactivate(false);
    } else {
      toast.error(result.error);
    }
  }

  if (!isActive) return null;

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          className="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
          aria-label="Abrir menu de ações do membro"
        >
          <MoreVertical className="size-4" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={4} className="z-50">
            <Menu.Popup className="border-border bg-popover min-w-[160px] rounded-md border p-1 shadow-sm">
              <Menu.Item
                className="hover:bg-accent/10 flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                onClick={handleToggleRole}
              >
                <Shield className="size-4" />
                {currentRole === "atelier_owner"
                  ? "Tornar membro"
                  : "Tornar proprietário"}
              </Menu.Item>
              <Menu.Item
                className="text-destructive hover:bg-destructive/10 flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                onClick={() => setConfirmDeactivate(true)}
              >
                <UserMinus className="size-4" />
                Desativar
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Dialog.Root open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="bg-card border-border fixed top-1/2 left-1/2 z-60 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-heading text-lg font-semibold">
                Desativar membro
              </Dialog.Title>
              <Dialog.Close
                className="text-muted-foreground hover:text-foreground rounded-md p-1"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-muted-foreground mt-2 text-sm">
              O membro perderá acesso ao atelier. Esta ação pode ser revertida.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close render={<Button variant="outline" type="button" />}>
                Cancelar
              </Dialog.Close>
              <Button
                variant="destructive"
                loading={loading}
                onClick={handleDeactivate}
              >
                Desativar
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
