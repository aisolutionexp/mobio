"use client";

import * as React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Check, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  addSpec,
  updateSpec,
  removeSpec,
  reorderSpecs,
} from "@/lib/actions/product-specs";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";

type Spec = {
  id: string;
  spec_key: string;
  spec_value: string;
  sort_order: number;
};

export function ProductSpecsTab({
  productId,
  specs: initialSpecs,
}: {
  productId: string;
  specs: Spec[];
}) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const specs = initialSpecs;

  async function handleAdd(formData: FormData) {
    setSubmitting(true);
    formData.set("product_id", productId);
    const result = await addSpec(null, formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Especificação adicionada");
      setShowAddForm(false);
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(specId: string, formData: FormData) {
    setSubmitting(true);
    const result = await updateSpec(specId, formData);
    setSubmitting(false);

    if (result.success) {
      setEditingId(null);
      toast.success("Especificação atualizada");
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove(specId: string) {
    const result = await removeSpec(specId);
    if (result.success) {
      toast.success("Especificação removida");
    } else {
      toast.error(result.error);
    }
  }

  async function handleMove(specId: string, direction: "up" | "down") {
    const sorted = [...specs].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === specId);
    if (idx === -1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const tempOrder = sorted[idx].sort_order;
    sorted[idx] = { ...sorted[idx], sort_order: sorted[swapIdx].sort_order };
    sorted[swapIdx] = { ...sorted[swapIdx], sort_order: tempOrder };

    const result = await reorderSpecs({
      productId,
      ordering: sorted.map((s) => ({ id: s.id, sort_order: s.sort_order })),
    });

    if (!result.success) {
      toast.error(result.error);
    }
  }

  const sorted = [...specs].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <Eyebrow as="p">Especificações técnicas</Eyebrow>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus />}
          onClick={() => setShowAddForm(true)}
        >
          Adicionar
        </Button>
      </div>

      {showAddForm && (
        <Plate>
          <form action={handleAdd} className="flex items-end gap-3">
            <div className="flex-1">
              <TextInput
                name="spec_key"
                label="Rótulo"
                placeholder="Ex: Material"
                required
              />
            </div>
            <div className="flex-1">
              <TextInput
                name="spec_value"
                label="Valor"
                placeholder="Ex: Algodão 100%"
                required
              />
            </div>
            <div className="flex gap-1 pb-0.5">
              <Button
                type="submit"
                variant="accent"
                size="sm"
                loading={submitting}
              >
                <Check className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Plate>
      )}

      {sorted.length > 0 ? (
        <Plate>
          {sorted.map((spec, idx) => (
            <React.Fragment key={spec.id}>
              {editingId === spec.id ? (
                <form
                  action={(formData) => handleUpdate(spec.id, formData)}
                  className="flex items-end gap-3 py-2"
                >
                  <div className="flex-1">
                    <TextInput
                      name="spec_key"
                      label="Rótulo"
                      defaultValue={spec.spec_key}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <TextInput
                      name="spec_value"
                      label="Valor"
                      defaultValue={spec.spec_value}
                      required
                    />
                  </div>
                  <div className="flex gap-1 pb-0.5">
                    <Button
                      type="submit"
                      variant="accent"
                      size="sm"
                      loading={submitting}
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground text-sm">
                      {spec.spec_key}
                    </span>
                    <span className="text-sm font-medium">
                      {spec.spec_value}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMove(spec.id, "up")}
                      disabled={idx === 0}
                      className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-30"
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(spec.id, "down")}
                      disabled={idx === sorted.length - 1}
                      className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-30"
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(spec.id)}
                      className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                      aria-label="Editar especificação"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(spec.id)}
                      className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
                      aria-label="Remover especificação"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {idx < sorted.length - 1 && <Rule spacing="sm" />}
            </React.Fragment>
          ))}
        </Plate>
      ) : (
        !showAddForm && (
          <Plate className="flex flex-col items-center py-10 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma especificação cadastrada
            </p>
          </Plate>
        )
      )}
    </div>
  );
}
