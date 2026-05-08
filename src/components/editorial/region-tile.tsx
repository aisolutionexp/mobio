import Link from "next/link";

import { cn } from "@/lib/utils";

interface RegionTileProps {
  region: { id: string; name: string; code: string };
  factoryCount: number;
  href?: string;
  className?: string;
}

function RegionTile({
  region,
  factoryCount,
  href,
  className,
}: RegionTileProps) {
  const target = href ?? `/lojista/praca?region=${region.id}`;

  return (
    <Link
      href={target}
      data-slot="region-tile"
      className={cn(
        "border-border bg-card hover:border-accent group flex min-w-[140px] flex-col items-start gap-1 rounded-lg border p-4 transition-colors",
        className,
      )}
    >
      <span className="font-heading text-base font-semibold tracking-tight group-hover:underline">
        {region.name}
      </span>
      <span className="text-muted-foreground text-xs">
        {factoryCount} {factoryCount === 1 ? "atelie" : "atelies"}
      </span>
    </Link>
  );
}

export { RegionTile };
export type { RegionTileProps };
