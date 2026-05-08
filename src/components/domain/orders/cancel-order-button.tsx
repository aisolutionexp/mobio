"use client";

import * as React from "react";
import { toast } from "sonner";
import { Ban } from "lucide-react";

import { cancelOrder } from "@/lib/actions/orders-retailer";
import { Button } from "@/components/ui/button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  async function handleCancel() {
    setLoading(true);
    const result = await cancelOrder(orderId);
    setLoading(false);
    setConfirming(false);

    if (result.success) {
      toast.success("Pedido cancelado com sucesso");
    } else {
      toast.error(result.error);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-destructive text-sm font-medium">
          Confirmar cancelamento?
        </span>
        <Button
          variant="destructive"
          size="sm"
          loading={loading}
          onClick={handleCancel}
        >
          Sim, cancelar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
      <Ban className="mr-1.5 size-3.5" />
      Solicitar cancelamento
    </Button>
  );
}
