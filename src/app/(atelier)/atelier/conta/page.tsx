import Link from "next/link";
import { Users, User, CreditCard } from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";

const CONTA_SECTIONS = [
  {
    title: "Equipe",
    description: "Gerencie membros e convites",
    href: "/atelier/conta/equipe",
    icon: Users,
  },
  {
    title: "Perfil",
    description: "Seus dados pessoais",
    href: "/atelier/conta/perfil",
    icon: User,
  },
  {
    title: "Faturamento",
    description: "Plano e pagamentos",
    href: "/atelier/conta/faturamento",
    icon: CreditCard,
  },
] as const;

export default function ContaPage() {
  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Atelier"
        title="Configurações"
        description="Gerencie sua conta e equipe"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONTA_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Plate className="group hover:border-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-md">
                    <SectionIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-heading group-hover:text-accent text-base font-semibold transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Plate>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
