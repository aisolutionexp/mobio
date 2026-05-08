import { Plus, CalendarDays } from "lucide-react";

import { listFactoryShowrooms } from "@/lib/actions/showrooms";
import { Masthead } from "@/components/editorial/masthead";
import { Button } from "@/components/ui/button";
import { ShowroomCard } from "@/components/domain/showroom/showroom-card";
import { CreateShowroomDrawer } from "@/components/domain/showroom/create-showroom-drawer";

export default async function ShowroomsPage() {
  const showrooms = await listFactoryShowrooms();

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Agenda"
        title="Showrooms"
        description="Gerencie seus showrooms e horários de visita"
        actions={
          <CreateShowroomDrawer>
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="size-3.5" />}
            >
              Novo showroom
            </Button>
          </CreateShowroomDrawer>
        }
      />

      {showrooms.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <CalendarDays className="text-muted-foreground/50 size-10" />
          <p className="text-sm">Nenhum showroom criado</p>
          <p className="text-xs">
            Crie showrooms para que lojistas possam agendar visitas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {showrooms.map((showroom) => (
            <ShowroomCard key={showroom.id} showroom={showroom} />
          ))}
        </div>
      )}
    </div>
  );
}
