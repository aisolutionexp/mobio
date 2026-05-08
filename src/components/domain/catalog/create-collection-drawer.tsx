"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";

import { createCollection } from "@/lib/actions/collections";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";
import { Eyebrow } from "@/components/editorial/eyebrow";

export function CreateCollectionDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    const result = await createCollection(null, formData);

    setSubmitting(false);

    if (result.success) {
      toast.success("Coleção criada com sucesso");
      setOpen(false);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={children as React.ReactElement} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity" />
        <Dialog.Popup className="bg-card border-border fixed inset-y-0 right-0 z-60 flex w-full max-w-md flex-col border-l shadow-lg">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <Eyebrow as="span">Nova coleção</Eyebrow>
            <Dialog.Close className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form action={handleSubmit} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <TextInput
                name="name"
                label="Nome da coleção"
                placeholder="Ex: Primavera/Verão 2027"
                required
                minLength={3}
                maxLength={100}
                error={error && error.includes("nome") ? error : undefined}
              />

              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <FieldControl>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva a coleção (opcional)"
                    maxLength={500}
                    showCount
                    autoResize
                  />
                </FieldControl>
              </Field>
            </div>

            <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
              <Dialog.Close render={<Button variant="outline" type="button" />}>
                Cancelar
              </Dialog.Close>
              <Button type="submit" variant="accent" loading={submitting}>
                Criar coleção
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
