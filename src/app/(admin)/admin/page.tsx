import { Store, Factory, Users, ShieldCheck } from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";

const STATS = [
  { label: "Lojistas", value: "—", icon: Store },
  { label: "Fábricas", value: "—", icon: Factory },
  { label: "Usuários", value: "—", icon: Users },
  { label: "Verificações pendentes", value: "—", icon: ShieldCheck },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Masthead eyebrow="Painel" title="Administração" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Plate key={stat.label} padded>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground size-5"
                  />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="font-heading text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Plate>
          );
        })}
      </div>
    </div>
  );
}
