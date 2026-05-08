"use client";

import * as React from "react";
import { Clock, MapPin, XCircle } from "lucide-react";
import { toast } from "sonner";

import { cancelMyBooking } from "@/lib/actions/showroom-bookings";
import { Plate } from "@/components/editorial/plate";
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

interface RetailerBookingCardProps {
  booking: {
    id: string;
    status: string;
    notes: string | null;
    created_at: string;
    showroom_slots: {
      id: string;
      starts_at: string;
      ends_at: string;
      location_details: string | null;
      showrooms: {
        id: string;
        name: string;
        type: string;
        location: string | null;
        factories: {
          id: string;
          name: string;
          slug: string;
        } | null;
      } | null;
    } | null;
  };
}

export function RetailerBookingCard({ booking }: RetailerBookingCardProps) {
  const [loading, setLoading] = React.useState(false);

  const slot = booking.showroom_slots;
  const showroom = slot?.showrooms;
  const factory = showroom?.factories;

  async function handleCancel() {
    setLoading(true);
    const result = await cancelMyBooking(booking.id);
    setLoading(false);
    if (result.success) {
      toast.success("Reserva cancelada");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Plate className="flex items-center gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-heading text-sm font-semibold">
            {showroom?.name ?? "Showroom"}
          </p>
          <Badge
            variant={STATUS_VARIANTS[booking.status] ?? "outline"}
            size="sm"
          >
            {STATUS_LABELS[booking.status] ?? booking.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          {factory?.name ?? "Ateliê"}
        </p>
        {slot && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
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
            </span>
            {(showroom?.location || slot.location_details) && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {slot.location_details ?? showroom?.location}
              </span>
            )}
          </div>
        )}
        {booking.notes && (
          <p className="text-muted-foreground text-xs">{booking.notes}</p>
        )}
      </div>
      {booking.status === "pending" && (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<XCircle className="size-3.5" />}
          onClick={handleCancel}
          loading={loading}
          className="text-destructive"
        >
          Cancelar
        </Button>
      )}
    </Plate>
  );
}
