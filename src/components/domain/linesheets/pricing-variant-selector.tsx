"use client";

import * as React from "react";
import { Field, FieldLabel } from "@/components/ui/field";

const VARIANTS = [
  {
    value: "retailer",
    label: "Preço atacado",
    description: "Preço B2B da fábrica",
  },
  {
    value: "msrp",
    label: "Preço sugerido",
    description: "Preço sugerido ao público",
  },
  {
    value: "custom",
    label: "Preço customizado",
    description: "Defina um preço por item",
  },
] as const;

export function PricingVariantSelector({
  name,
  defaultValue = "retailer",
  onChange,
}: {
  name: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [selected, setSelected] = React.useState(defaultValue);

  function handleChange(value: string) {
    setSelected(value);
    onChange?.(value);
  }

  return (
    <Field>
      <FieldLabel>Variante de preço</FieldLabel>
      <input type="hidden" name={name} value={selected} />
      <div className="mt-1 space-y-2">
        {VARIANTS.map((variant) => (
          <label
            key={variant.value}
            className={`border-border hover:border-accent/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              selected === variant.value ? "border-accent bg-accent/5" : ""
            }`}
          >
            <input
              type="radio"
              name={`${name}_radio`}
              value={variant.value}
              checked={selected === variant.value}
              onChange={() => handleChange(variant.value)}
              className="accent-accent mt-0.5"
            />
            <div>
              <p className="text-sm font-medium">{variant.label}</p>
              <p className="text-muted-foreground text-xs">
                {variant.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </Field>
  );
}
