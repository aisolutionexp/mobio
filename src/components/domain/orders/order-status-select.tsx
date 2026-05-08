"use client";

import * as React from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/lib/actions/orders";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Processando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [selected, setSelected] = React.useState(currentStatus);
  const [confirming, setConfirming] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await updateOrderStatus(
      orderId,
      selected as
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled",
    );
    setLoading(false);
    setConfirming(false);

    if (result.success) {
      toast.success("Status atualizado");
    } else {
      toast.error(result.error);
      setSelected(currentStatus);
    }
  }

  function handleChange(value: string) {
    setSelected(value);
    if (value !== currentStatus) {
      setConfirming(true);
    } else {
      setConfirming(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        options={STATUS_OPTIONS}
        value={selected}
        onValueChange={handleChange}
        className="w-48"
      />
      {confirming && (
        <div className="flex items-center gap-2">
          <Button
            variant="accent"
            size="sm"
            loading={loading}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelected(currentStatus);
              setConfirming(false);
            }}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
