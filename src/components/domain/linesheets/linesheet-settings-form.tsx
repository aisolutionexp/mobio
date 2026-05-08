"use client";

import * as React from "react";
import { toast } from "sonner";

import { updateLinesheet } from "@/lib/actions/linesheets";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";
import { PricingVariantSelector } from "@/components/domain/linesheets/pricing-variant-selector";

export function LinesheetSettingsForm({
  linesheetId,
  initialName,
  initialDescription,
  initialPricingVariant,
  itemCount,
  updatedAt,
}: {
  linesheetId: string;
  initialName: string;
  initialDescription: string | null;
  initialPricingVariant: string;
  itemCount: number;
  updatedAt: string;
}) {
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(
    initialDescription ?? "",
  );
  const [pricingVariant, setPricingVariant] = React.useState(
    initialPricingVariant,
  );
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await updateLinesheet(linesheetId, {
      name: name.trim(),
      description: description.trim(),
      pricing_variant: pricingVariant,
    });

    setSaving(false);

    if (result.success) {
      toast.success("Configurações salvas");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <TextInput
          name="name"
          label="Nome do linesheet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          maxLength={100}
        />

        <Field>
          <FieldLabel htmlFor="settings-description">Descrição</FieldLabel>
          <FieldControl>
            <Textarea
              id="settings-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste linesheet (opcional)"
              maxLength={500}
              showCount
              autoResize
            />
          </FieldControl>
        </Field>

        <PricingVariantSelector
          name="pricing_variant"
          defaultValue={pricingVariant}
          onChange={setPricingVariant}
        />

        <Button type="submit" variant="accent" loading={saving}>
          Salvar configurações
        </Button>
      </form>

      <div className="border-border max-w-md rounded-lg border p-4">
        <p className="text-sm font-medium">Estatísticas</p>
        <div className="text-muted-foreground mt-2 space-y-1 text-sm">
          <p>
            {itemCount} {itemCount === 1 ? "produto" : "produtos"}
          </p>
          <p>
            Última edição:{" "}
            {new Date(updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
