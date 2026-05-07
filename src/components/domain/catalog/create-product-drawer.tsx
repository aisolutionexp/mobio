"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";

import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";
import { Eyebrow } from "@/components/editorial/eyebrow";

export function CreateProductDrawer({
  collectionId,
  children,
}: {
  collectionId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);

    const result = await createProduct(null, formData);

    setSubmitting(false);

    if (result.success) {
      toast.success("Produto criado com sucesso");
      setOpen(false);
    } else {
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
            <Eyebrow as="span">Novo produto</Eyebrow>
            <Dialog.Close className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form action={handleSubmit} className="flex flex-1 flex-col">
            <input type="hidden" name="collection_id" value={collectionId} />

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <TextInput
                name="name"
                label="Nome do produto"
                placeholder="Ex: Blazer Alfaiataria"
                required
                minLength={3}
                maxLength={200}
              />

              <TextInput
                name="sku"
                label="Referência (SKU)"
                placeholder="Ex: BLZ-001"
                required
                minLength={3}
                maxLength={50}
              />

              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <FieldControl>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o produto (opcional)"
                    maxLength={1000}
                    showCount
                    autoResize
                  />
                </FieldControl>
              </Field>

              <TextInput
                name="wholesale_price"
                label="Preço atacado (R$)"
                type="number"
                placeholder="0,00"
                min={0}
                step={0.01}
              />
            </div>

            <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
              <Dialog.Close render={<Button variant="outline" type="button" />}>
                Cancelar
              </Dialog.Close>
              <Button type="submit" variant="accent" loading={submitting}>
                Criar produto
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
