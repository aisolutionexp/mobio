"use client";

import * as React from "react";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

import { listAvailableSlots } from "@/lib/actions/showroom-bookings";
import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookSlotDialog } from "./book-slot-dialog";

interface ShowroomWithSlots {
  id: string;
  name: string;
  type: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  capacity: number | null;
  status: string;
  factory_id: string;
  factories: {
    id: string;
    name: string;
    slug: string;
    logo_path: string | null;
  } | null;
}

export function AvailableShowroomsList({
  showrooms,
}: {
  showrooms: ShowroomWithSlots[];
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [slots, setSlots] = React.useState<
    {
      id: string;
      showroom_id: string;
      starts_at: string;
      ends_at: string;
      max_attendees: number;
      is_available: boolean;
      location_details: string | null;
    }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<
    (typeof slots)[0] | null
  >(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeShowroomName, setActiveShowroomName] = React.useState("");

  async function handleExpand(showroom: ShowroomWithSlots) {
    if (expandedId === showroom.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(showroom.id);
    setLoadingSlots(true);
    try {
      const data = await listAvailableSlots(showroom.id);
      setSlots(data);
    } catch {
      setSlots([]);
    }
    setLoadingSlots(false);
  }

  function handleBookSlot(slot: (typeof slots)[0], showroomName: string) {
    setSelectedSlot(slot);
    setActiveShowroomName(showroomName);
    setDialogOpen(true);
  }

  if (showrooms.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
        <Calendar className="text-muted-foreground/50 size-10" />
        <p className="text-sm">Nenhum showroom disponível no momento</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {showrooms.map((showroom) => (
          <div key={showroom.id}>
            <Plate
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleExpand(showroom)}
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-sm font-semibold">
                      {showroom.name}
                    </p>
                    <Badge variant="secondary" size="sm">
                      {showroom.type === "physical" ? "Presencial" : "Virtual"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {showroom.factories?.name ?? "Ateliê"}
                  </p>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    {showroom.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(showroom.event_date).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    )}
                    {showroom.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {showroom.location}
                      </span>
                    )}
                  </div>
                  {showroom.description && (
                    <p className="text-muted-foreground text-xs">
                      {showroom.description}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  {expandedId === showroom.id ? "Fechar" : "Ver horários"}
                </Button>
              </div>
            </Plate>

            {expandedId === showroom.id && (
              <div className="mt-2 ml-4 space-y-2">
                {loadingSlots ? (
                  <p className="text-muted-foreground text-sm">
                    Carregando horários...
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhum horário disponível
                  </p>
                ) : (
                  slots.map((slot) => {
                    const start = new Date(slot.starts_at);
                    const end = new Date(slot.ends_at);

                    return (
                      <Plate
                        key={slot.id}
                        className="flex items-center gap-4"
                        padded
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="flex items-center gap-1 text-sm">
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
                          <div className="text-muted-foreground flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {slot.max_attendees} vaga
                              {slot.max_attendees !== 1 ? "s" : ""}
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
                          variant="accent"
                          size="sm"
                          onClick={() => handleBookSlot(slot, showroom.name)}
                        >
                          Agendar
                        </Button>
                      </Plate>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedSlot && (
        <BookSlotDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          slot={selectedSlot}
          showroomName={activeShowroomName}
        />
      )}
    </>
  );
}
