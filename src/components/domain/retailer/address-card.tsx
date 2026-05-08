"use client";

import * as React from "react";
import { MapPin, Star, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  deleteRetailerAddress,
  setDefaultAddress,
} from "@/lib/actions/retailer-addresses";
import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AddressCardProps {
  id: string;
  label: string;
  recipientName: string;
  addressLine: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  onEdit: () => void;
}

export function AddressCard({
  id,
  label,
  recipientName,
  addressLine,
  complement,
  neighborhood,
  city,
  state,
  zipCode,
  isDefault,
  onEdit,
}: AddressCardProps) {
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteRetailerAddress(id);
    setDeleting(false);
    setConfirming(false);

    if (result.success) {
      toast.success("Endereço removido");
    } else {
      toast.error(result.error);
    }
  }

  async function handleSetDefault() {
    const result = await setDefaultAddress(id);
    if (result.success) {
      toast.success("Endereço padrão atualizado");
    } else {
      toast.error(result.error);
    }
  }

  const formattedAddress = [
    addressLine,
    complement,
    neighborhood,
    `${city} - ${state}`,
    zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Plate className="flex items-start gap-4">
      <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-md">
        <MapPin className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-heading text-sm font-semibold">{label}</p>
          {isDefault && (
            <Badge variant="accent" size="sm">
              Padrão
            </Badge>
          )}
        </div>
        <p className="text-sm">{recipientName}</p>
        <p className="text-muted-foreground mt-1 text-xs">{formattedAddress}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSetDefault}
            leftIcon={<Star className="size-3.5" />}
          >
            Padrão
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          leftIcon={<Pencil className="size-3.5" />}
        >
          Editar
        </Button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <Button
              variant="destructive"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
            >
              Confirmar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(true)}
            leftIcon={<Trash2 className="text-destructive size-3.5" />}
          >
            Remover
          </Button>
        )}
      </div>
    </Plate>
  );
}
