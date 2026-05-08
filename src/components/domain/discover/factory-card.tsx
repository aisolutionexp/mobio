import Link from "next/link";

import { cn } from "@/lib/utils";
import { Plate } from "@/components/editorial/plate";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./favorite-button";

interface FactoryCardProps {
  factory: {
    id: string;
    name: string;
    slug: string;
    logo_path: string | null;
    description: string | null;
    regionName: string | null;
    categories: { id: string; name: string; slug: string }[];
  };
  isFavorited?: boolean;
  className?: string;
}

export function FactoryCard({
  factory,
  isFavorited = false,
  className,
}: FactoryCardProps) {
  const initials = factory.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Plate className={cn("group relative", className)}>
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          targetId={factory.id}
          type="factory"
          isFavorited={isFavorited}
        />
      </div>
      <Link
        href={`/fabrica/${factory.slug}`}
        className="flex items-start gap-4"
      >
        <Avatar
          alt={factory.name}
          src={factory.logo_path ?? undefined}
          fallback={initials}
          size="lg"
          shape="square"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-heading text-base leading-tight font-semibold group-hover:underline">
            {factory.name}
          </h3>
          {factory.regionName && (
            <p className="text-muted-foreground text-xs">
              {factory.regionName}
            </p>
          )}
          {factory.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {factory.description}
            </p>
          )}
          {factory.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {factory.categories.slice(0, 3).map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-xs">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Plate>
  );
}
