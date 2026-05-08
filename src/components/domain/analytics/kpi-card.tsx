import type { LucideIcon } from "lucide-react";

import { Plate } from "@/components/editorial/plate";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function KpiCard({ label, value, icon: Icon }: KpiCardProps) {
  return (
    <Plate accent>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-heading text-3xl font-bold">{value}</p>
          <p className="text-muted-foreground mt-1 text-sm">{label}</p>
        </div>
        <Icon aria-hidden="true" className="text-muted-foreground size-5" />
      </div>
    </Plate>
  );
}
