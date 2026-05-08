"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { recordPayment } from "@/lib/actions/payments";
import { toast } from "sonner";

const PAYMENT_METHOD_OPTIONS = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "transfer", label: "Transferência" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "other", label: "Outro" },
];

interface RecordPaymentDialogProps {
  scheduleId: string;
  maxCents: number;
  currency?: string;
}

export function RecordPaymentDialog({
  scheduleId,
  maxCents,
  currency = "BRL",
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [ref, setRef] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !method) return;

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast.error("Valor inválido");
      return;
    }

    setPending(true);
    const result = await recordPayment(
      scheduleId,
      amountCents,
      method,
      ref || undefined,
    );

    if (result.success) {
      toast.success("Pagamento registrado com sucesso");
      setOpen(false);
      setAmount("");
      setMethod("");
      setRef("");
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="size-4" />
          Registrar pagamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            Registre um pagamento recebido para este pedido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Método de pagamento</Label>
            <Select
              options={PAYMENT_METHOD_OPTIONS}
              value={method}
              onValueChange={setMethod}
              placeholder="Selecione"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ref">Referência (opcional)</Label>
            <Input
              id="ref"
              placeholder="ID da transação, comprovante..."
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !amount || !method}>
              {pending ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
