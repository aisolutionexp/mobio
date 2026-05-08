"use client";

import * as React from "react";
import { Clock, Users, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteSlot } from "@/lib/actions/showrooms";
import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SlotCardProps {
  slot: {
    id: string;
    starts_at: string;
    ends_at: string;
    max_attendees: number;
    is_available: boolean;
    location_details: string | null;
  };
}

export function SlotCard({ slot }: SlotCardProps) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteSlot(slot.id);
    setDeleting(false);
    if (result.success) {
      toast.success("Slot removido");
    } else {
      toast.error(result.error);
    }
  }

  const start = new Date(slot.starts_at);
  const end = new Date(slot.ends_at);

  return (
    <Plate className="flex items-center gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm font-medium">
            <Clock className="size-3.5" />
            {start.toLocaleDateString("pt-BR")}{" "}
            {start.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" — "}
            {end.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <Badge variant={slot.is_available ? "default" : "outline"} size="sm">
            {slot.is_available ? "Disponível" : "Lotado"}
          </Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {slot.max_attendees} vaga{slot.max_attendees !== 1 ? "s" : ""}
          </span>
          {slot.location_details && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {slot.location_details}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Trash2 className="size-3.5" />}
        onClick={handleDelete}
        loading={deleting}
        className="text-destructive"
      >
        Remover
      </Button>
    </Plate>
  );
}
