"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { addFinish, removeFinish } from "@/lib/actions/finishes";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";

type Finish = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export function ProductFinishesTab({
  finishes: initialFinishes,
}: {
  finishes: Finish[];
}) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const finishes = initialFinishes;

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    const result = await addFinish(null, formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Acabamento adicionado");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove(finishId: string) {
    setRemovingId(finishId);
    const result = await removeFinish(finishId);
    if (result.success) {
      toast.success("Acabamento removido");
    } else {
      toast.error(result.error);
    }
    setRemovingId(null);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <Eyebrow as="p">Acabamentos da fábrica</Eyebrow>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            render={
              <Button variant="outline" size="sm" leftIcon={<Plus />}>
                Adicionar
              </Button>
            }
          />
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity" />
            <Dialog.Popup className="bg-card border-border fixed inset-y-0 right-0 z-60 flex w-full max-w-md flex-col border-l shadow-lg">
              <div className="border-border flex items-center justify-between border-b px-6 py-4">
                <Eyebrow as="span">Novo acabamento</Eyebrow>
                <Dialog.Close className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors">
                  <X className="size-4" />
                </Dialog.Close>
              </div>

              <form action={handleSubmit} className="flex flex-1 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                  <TextInput
                    name="name"
                    label="Nome"
                    placeholder="Ex: Couro Natural"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                  <Field>
                    <FieldLabel htmlFor="finish-description">
                      Descrição
                    </FieldLabel>
                    <FieldControl>
                      <Textarea
                        id="finish-description"
                        name="description"
                        placeholder="Descreva o acabamento (opcional)"
                        maxLength={500}
                        showCount
                        autoResize
                      />
                    </FieldControl>
                  </Field>
                </div>

                <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
                  <Dialog.Close
                    render={<Button variant="outline" type="button" />}
                  >
                    Cancelar
                  </Dialog.Close>
                  <Button type="submit" variant="accent" loading={submitting}>
                    Adicionar
                  </Button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {finishes.length > 0 ? (
        <Plate>
          {finishes.map((finish, idx) => (
            <React.Fragment key={finish.id}>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{finish.name}</p>
                  {finish.description && (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {finish.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(finish.id)}
                  disabled={removingId === finish.id}
                  className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
                  aria-label="Remover acabamento"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {idx < finishes.length - 1 && <Rule spacing="sm" />}
            </React.Fragment>
          ))}
        </Plate>
      ) : (
        <Plate className="flex flex-col items-center py-10 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum acabamento cadastrado
          </p>
        </Plate>
      )}
    </div>
  );
}
