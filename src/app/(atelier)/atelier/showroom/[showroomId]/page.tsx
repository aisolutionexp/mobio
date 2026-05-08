import Link from "next/link";
import { Plus, ArrowLeft, Clock, CalendarDays } from "lucide-react";

import {
  getShowroom,
  listShowroomSlots,
  listShowroomBookings,
} from "@/lib/actions/showrooms";
import { Masthead } from "@/components/editorial/masthead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShowroomTabs } from "@/components/domain/showroom/showroom-tabs";
import { SlotCard } from "@/components/domain/showroom/slot-card";
import { BookingCard } from "@/components/domain/showroom/booking-card";
import { CreateSlotDrawer } from "@/components/domain/showroom/create-slot-drawer";

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  active: "Ativo",
  ended: "Encerrado",
  cancelled: "Cancelado",
};

export default async function ShowroomDetailPage({
  params,
}: {
  params: Promise<{ showroomId: string }>;
}) {
  const { showroomId } = await params;
  const [showroom, slots, bookings] = await Promise.all([
    getShowroom(showroomId),
    listShowroomSlots(showroomId),
    listShowroomBookings(showroomId),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/atelier/showroom"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Voltar para showrooms
      </Link>

      <Masthead
        eyebrow="Showroom"
        title={showroom.name}
        description={showroom.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {STATUS_LABELS[showroom.status] ?? showroom.status}
            </Badge>
            <CreateSlotDrawer showroomId={showroomId}>
              <Button
                variant="accent"
                size="sm"
                leftIcon={<Plus className="size-3.5" />}
              >
                Adicionar slot
              </Button>
            </CreateSlotDrawer>
          </div>
        }
      />

      <ShowroomTabs
        slotsContent={
          slots.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <Clock className="text-muted-foreground/50 size-10" />
              <p className="text-sm">Nenhum slot criado</p>
              <p className="text-xs">
                Adicione slots de horário para que lojistas possam agendar.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              {slots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          )
        }
        bookingsContent={
          bookings.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <CalendarDays className="text-muted-foreground/50 size-10" />
              <p className="text-sm">Nenhuma reserva</p>
              <p className="text-xs">
                Quando lojistas agendarem visitas, as reservas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              {bookings.map((booking) => {
                const bookingForCard = {
                  id: booking.id,
                  status: booking.status,
                  notes: booking.notes,
                  created_at: booking.created_at,
                  showroom_slots: booking.showroom_slots
                    ? {
                        starts_at: booking.showroom_slots.starts_at,
                        ends_at: booking.showroom_slots.ends_at,
                      }
                    : null,
                  retailers: booking.retailers as {
                    id: string;
                    name: string;
                    slug: string;
                    logo_path: string | null;
                  } | null,
                };
                return (
                  <BookingCard key={booking.id} booking={bookingForCard} />
                );
              })}
            </div>
          )
        }
      />
    </div>
  );
}
