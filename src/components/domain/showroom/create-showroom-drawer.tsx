"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";

import { createShowroom } from "@/lib/actions/showrooms";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldHint,
} from "@/components/ui/field";
import { Eyebrow } from "@/components/editorial/eyebrow";

export function CreateShowroomDrawer({
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

    const result = await createShowroom(null, formData);

    setSubmitting(false);

    if (result.success) {
      toast.success("Showroom criado com sucesso");
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
            <Eyebrow as="span">Novo showroom</Eyebrow>
            <Dialog.Close
              className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
              aria-label="Fechar"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form action={handleSubmit} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <TextInput
                name="name"
                label="Nome do showroom"
                placeholder="Ex: Showroom Verão 2027"
                required
                minLength={1}
                maxLength={100}
              />

              <Field>
                <FieldLabel htmlFor="type">Tipo</FieldLabel>
                <FieldControl>
                  <select
                    id="type"
                    name="type"
                    defaultValue="physical"
                    className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    <option value="physical">Presencial</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </FieldControl>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <FieldControl>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o showroom (opcional)"
                    maxLength={500}
                    showCount
                    autoResize
                  />
                </FieldControl>
              </Field>

              <TextInput
                name="event_date"
                label="Data do evento"
                type="datetime-local"
              />

              <TextInput
                name="location"
                label="Localização"
                placeholder="Ex: Rua Augusta, 1200 — São Paulo"
                maxLength={200}
              />

              <Field>
                <FieldLabel htmlFor="capacity">Capacidade</FieldLabel>
                <FieldHint>Número total de participantes</FieldHint>
                <FieldControl>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min={1}
                    placeholder="Opcional"
                    className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  />
                </FieldControl>
              </Field>

              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
              <Dialog.Close render={<Button variant="outline" type="button" />}>
                Cancelar
              </Dialog.Close>
              <Button type="submit" variant="accent" loading={submitting}>
                Criar showroom
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
