"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { sendFactoryInvitation } from "@/lib/actions/factory-invitations";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Eyebrow } from "@/components/editorial/eyebrow";

export function InviteRetailerDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [invitationUrl, setInvitationUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [includeTerms, setIncludeTerms] = React.useState(true);

  async function handleSubmit(formData: FormData) {
    formData.set("include_terms_snapshot", includeTerms ? "true" : "false");
    setSubmitting(true);
    setError(null);

    const result = await sendFactoryInvitation(null, formData);

    setSubmitting(false);

    if (result.success) {
      toast.success("Convite criado com sucesso");
      setInvitationUrl(result.data.invitationUrl);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  function handleClose() {
    setOpen(false);
    setInvitationUrl(null);
    setError(null);
    setCopied(false);
    setIncludeTerms(true);
  }

  async function handleCopy() {
    if (!invitationUrl) return;
    await navigator.clipboard.writeText(invitationUrl);
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
            <Eyebrow as="span">Convidar lojista</Eyebrow>
            <Dialog.Close
              className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {invitationUrl ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
              <div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
                <Check className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                Convite criado
              </h3>
              <p className="text-muted-foreground text-center text-sm">
                Compartilhe o link abaixo com o lojista. O convite expira em 7
                dias.
              </p>
              <div className="bg-muted w-full rounded-md p-3">
                <p className="text-xs break-all">{invitationUrl}</p>
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
                  name="retailer_email"
                  label="Email do lojista"
                  type="email"
                  placeholder="lojista@empresa.com"
                  required
                />

                <TextInput
                  name="retailer_name"
                  label="Nome do lojista"
                  placeholder="Nome da loja ou responsável"
                  required
                  minLength={2}
                  maxLength={200}
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeTerms}
                    onChange={(e) => setIncludeTerms(e.target.checked)}
                    className="accent-accent size-4 rounded"
                  />
                  Incluir política comercial atual no convite
                </label>

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
