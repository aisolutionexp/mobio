"use client";

import * as React from "react";
import { toast } from "sonner";

import { bookShowroomSlot } from "@/lib/actions/showroom-bookings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";

interface BookSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: {
    id: string;
    starts_at: string;
    ends_at: string;
    location_details: string | null;
  };
  showroomName: string;
}

export function BookSlotDialog({
  open,
  onOpenChange,
  slot,
  showroomName,
}: BookSlotDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const start = new Date(slot.starts_at);
  const end = new Date(slot.ends_at);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    const result = await bookShowroomSlot(slot.id, null, formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Visita agendada com sucesso");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar visita</DialogTitle>
          <DialogDescription>
            {showroomName} — {start.toLocaleDateString("pt-BR")}{" "}
            {start.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" às "}
            {end.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {slot.location_details && ` — ${slot.location_details}`}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="notes">Observações (opcional)</FieldLabel>
            <FieldControl>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Alguma informação relevante para o ateliê..."
                maxLength={300}
                showCount
                autoResize
              />
            </FieldControl>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="accent" loading={submitting}>
              Confirmar agendamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
