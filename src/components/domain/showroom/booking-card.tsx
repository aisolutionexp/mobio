"use client";

import * as React from "react";
import { Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";

import { confirmBooking, cancelBooking } from "@/lib/actions/showrooms";
import { Plate } from "@/components/editorial/plate";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
};

interface BookingCardProps {
  booking: {
    id: string;
    status: string;
    notes: string | null;
    created_at: string;
    showroom_slots: {
      starts_at: string;
      ends_at: string;
    } | null;
    retailers: {
      id: string;
      name: string;
      slug: string;
      logo_path: string | null;
    } | null;
  };
}

export function BookingCard({ booking }: BookingCardProps) {
  const [loading, setLoading] = React.useState(false);

  const retailer = booking.retailers;
  const slot = booking.showroom_slots;

  const initials =
    retailer?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?";

  async function handleConfirm() {
    setLoading(true);
    const result = await confirmBooking(booking.id);
    setLoading(false);
    if (result.success) {
      toast.success("Reserva confirmada");
    } else {
      toast.error(result.error);
    }
  }

  async function handleCancel() {
    setLoading(true);
    const result = await cancelBooking(booking.id);
    setLoading(false);
    if (result.success) {
      toast.success("Reserva cancelada");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Plate className="flex items-center gap-4">
      <Avatar
        src={retailer?.logo_path ?? undefined}
        alt={retailer?.name ?? "Lojista"}
        fallback={initials}
        size="md"
        shape="square"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-heading text-sm font-semibold">
          {retailer?.name ?? "Lojista"}
        </p>
        {slot && (
          <p className="text-muted-foreground text-xs">
            {new Date(slot.starts_at).toLocaleDateString("pt-BR")}{" "}
            {new Date(slot.starts_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" — "}
            {new Date(slot.ends_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        {booking.notes && (
          <p className="text-muted-foreground text-xs">{booking.notes}</p>
        )}
      </div>
      <Badge variant={STATUS_VARIANTS[booking.status] ?? "outline"} size="sm">
        {STATUS_LABELS[booking.status] ?? booking.status}
      </Badge>
      {booking.status === "pending" && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Check className="size-3.5" />}
            onClick={handleConfirm}
            loading={loading}
          >
            Confirmar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<XIcon className="size-3.5" />}
            onClick={handleCancel}
            loading={loading}
            className="text-destructive"
          >
            Cancelar
          </Button>
        </div>
      )}
    </Plate>
  );
}
