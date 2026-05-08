"use client";

import * as React from "react";
import { toast } from "sonner";

import { updateLinesheetItemNote } from "@/lib/actions/linesheets";

export function LinesheetNoteInput({
  itemId,
  initialNote,
}: {
  itemId: string;
  initialNote: string | null;
}) {
  const [value, setValue] = React.useState(initialNote ?? "");
  const [saving, setSaving] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      save(next);
    }, 800);
  }

  async function save(note: string) {
    setSaving(true);
    const result = await updateLinesheetItemNote(itemId, note.trim() || null);
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
    save(value);
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="Adicionar nota..."
      maxLength={1000}
      className="text-muted-foreground placeholder:text-muted-foreground/50 w-full border-none bg-transparent text-xs outline-none"
      aria-label="Nota do produto"
      disabled={saving}
    />
  );
}
