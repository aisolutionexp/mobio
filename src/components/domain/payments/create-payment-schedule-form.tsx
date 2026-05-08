"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentSchedule } from "@/lib/actions/payments";
import { toast } from "sonner";

interface CreatePaymentScheduleFormProps {
  orderId: string;
}

export function CreatePaymentScheduleForm({
  orderId,
}: CreatePaymentScheduleFormProps) {
  const [signalPct, setSignalPct] = useState("30");
  const [dueDate, setDueDate] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pct = parseInt(signalPct, 10);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Percentual inválido");
      return;
    }

    setPending(true);
    const result = await createPaymentSchedule(
      orderId,
      pct,
      dueDate || undefined,
    );

    if (result.success) {
      toast.success("Agenda de pagamento criada");
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Defina as condições de pagamento para este pedido.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signal_pct">Sinal (%)</Label>
          <Input
            id="signal_pct"
            type="number"
            min="0"
            max="100"
            value={signalPct}
            onChange={(e) => setSignalPct(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Vencimento (opcional)</Label>
          <Input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar agenda de pagamento"}
      </Button>
    </form>
  );
}
