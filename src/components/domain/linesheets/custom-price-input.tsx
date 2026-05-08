"use client";

import * as React from "react";
import { toast } from "sonner";

import { updateLinesheetItemCustomPrice } from "@/lib/actions/linesheets";

export function CustomPriceInput({
  itemId,
  initialPrice,
}: {
  itemId: string;
  initialPrice: number | null;
}) {
  const [value, setValue] = React.useState(
    initialPrice != null ? String(initialPrice) : "",
  );
  const [saving, setSaving] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
    setValue(raw);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      save(raw);
    }, 800);
  }

  async function save(raw: string) {
    const num = parseFloat(raw);
    if (isNaN(num) || num <= 0) return;

    setSaving(true);
    const result = await updateLinesheetItemCustomPrice(itemId, num);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
    }
  }

  function handleBlur() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (value) save(value);
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground text-xs">R$</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0,00"
        className="text-accent w-20 border-none bg-transparent text-sm font-semibold outline-none"
        aria-label="Preço customizado"
        disabled={saving}
      />
    </div>
  );
}
