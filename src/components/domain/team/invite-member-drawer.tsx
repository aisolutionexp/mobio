"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { inviteMember } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Select } from "@/components/ui/select";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";
import { Eyebrow } from "@/components/editorial/eyebrow";

const ROLE_OPTIONS = [
  { value: "atelier_member", label: "Membro" },
  { value: "atelier_owner", label: "Proprietário" },
];

export function InviteMemberDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [role, setRole] = React.useState("atelier_member");

  async function handleSubmit(formData: FormData) {
    formData.set("role", role);
    setSubmitting(true);
    setError(null);

    const result = await inviteMember(null, formData);

    setSubmitting(false);

    if (result.success) {
      toast.success("Convite enviado com sucesso");
      setInviteUrl(result.data.inviteUrl);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  function handleClose() {
    setOpen(false);
    setInviteUrl(null);
    setError(null);
    setCopied(false);
    setRole("atelier_member");
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(val) => (val ? setOpen(true) : handleClose())}
    >
      <Dialog.Trigger render={children as React.ReactElement} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity" />
        <Dialog.Popup className="bg-card border-border fixed inset-y-0 right-0 z-60 flex w-full max-w-md flex-col border-l shadow-lg">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <Eyebrow as="span">Convidar membro</Eyebrow>
            <Dialog.Close
              className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
              onClick={handleClose}
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {inviteUrl ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
              <div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
                <Check className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                Convite criado
              </h3>
              <p className="text-muted-foreground text-center text-sm">
                Compartilhe o link abaixo com o novo membro. O convite expira em
                7 dias.
              </p>
              <div className="bg-muted w-full rounded-md p-3">
                <p className="text-xs break-all">{inviteUrl}</p>
              </div>
              <Button
                variant="accent"
                onClick={handleCopy}
                leftIcon={copied ? <Check /> : <Copy />}
              >
                {copied ? "Copiado" : "Copiar link"}
              </Button>
            </div>
          ) : (
            <form action={handleSubmit} className="flex flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                <TextInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="nome@empresa.com"
                  required
                  error={error && error.includes("email") ? error : undefined}
                />

                <Field>
                  <FieldLabel htmlFor="role">Papel</FieldLabel>
                  <FieldControl>
                    <Select
                      name="role"
                      options={ROLE_OPTIONS}
                      value={role}
                      onValueChange={setRole}
                      placeholder="Selecione o papel"
                    />
                  </FieldControl>
                </Field>

                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
                <Dialog.Close
                  render={<Button variant="outline" type="button" />}
                  onClick={handleClose}
                >
                  Cancelar
                </Dialog.Close>
                <Button type="submit" variant="accent" loading={submitting}>
                  Enviar convite
                </Button>
              </div>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
