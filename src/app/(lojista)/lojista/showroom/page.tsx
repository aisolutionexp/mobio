import {
  listAvailableShowrooms,
  listRetailerBookings,
} from "@/lib/actions/showroom-bookings";
import { Masthead } from "@/components/editorial/masthead";
import { RetailerShowroomTabs } from "@/components/domain/showroom/retailer-showroom-tabs";
import { AvailableShowroomsList } from "@/components/domain/showroom/available-showrooms-list";
import { RetailerBookingCard } from "@/components/domain/showroom/retailer-booking-card";
import { CalendarDays } from "lucide-react";

export default async function RetailerShowroomPage() {
  const [showrooms, bookings] = await Promise.all([
    listAvailableShowrooms(),
    listRetailerBookings(),
  ]);

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Agenda"
        title="Showrooms"
        description="Agende visitas aos showrooms dos ateliês"
      />

      <RetailerShowroomTabs
        availableContent={
          <div className="pt-4">
            <AvailableShowroomsList showrooms={showrooms} />
          </div>
        }
        bookingsContent={
          bookings.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <CalendarDays className="text-muted-foreground/50 size-10" />
              <p className="text-sm">Nenhum agendamento</p>
              <p className="text-xs">
                Quando você agendar visitas, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              {bookings.map((booking) => (
                <RetailerBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )
        }
      />
    </div>
  );
}
