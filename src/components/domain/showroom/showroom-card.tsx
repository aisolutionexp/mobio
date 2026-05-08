import Link from "next/link";
import { Calendar, MapPin, Users, Eye } from "lucide-react";

import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  active: "Ativo",
  ended: "Encerrado",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  published: "secondary",
  active: "default",
  ended: "outline",
  cancelled: "destructive",
};

interface ShowroomCardProps {
  showroom: {
    id: string;
    name: string;
    type: string;
    event_date: string | null;
    location: string | null;
    capacity: number | null;
    status: string;
  };
  slotsCount?: number;
  bookingsCount?: number;
}

export function ShowroomCard({
  showroom,
  slotsCount,
  bookingsCount,
}: ShowroomCardProps) {
  return (
    <Plate className="flex items-center gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-heading text-sm font-semibold">{showroom.name}</p>
          <Badge
            variant={STATUS_VARIANTS[showroom.status] ?? "outline"}
            size="sm"
          >
            {STATUS_LABELS[showroom.status] ?? showroom.status}
          </Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          {showroom.event_date && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(showroom.event_date).toLocaleDateString("pt-BR")}
            </span>
          )}
          {showroom.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {showroom.location}
            </span>
          )}
          {showroom.capacity && (
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {showroom.capacity} vagas
            </span>
          )}
          {slotsCount !== undefined && (
            <span>
              {slotsCount} slot{slotsCount !== 1 ? "s" : ""}
            </span>
          )}
          {bookingsCount !== undefined && (
            <span>
              {bookingsCount} reserva{bookingsCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      <Link href={`/atelier/showroom/${showroom.id}`}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Eye className="size-3.5" />}
        >
          Ver
        </Button>
      </Link>
    </Plate>
  );
}
