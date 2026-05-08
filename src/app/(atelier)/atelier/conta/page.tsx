import Link from "next/link";
import { Users, User, CreditCard, Settings2, Receipt } from "lucide-react";

import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { PushSubscribeButton } from "@/components/domain/notifications/push-subscribe-button";

const CONTA_SECTIONS = [
  {
    title: "Equipe",
    description: "Gerencie membros e convites",
    href: "/atelier/conta/equipe",
    icon: Users,
  },
  {
    title: "Configurações comerciais",
    description: "Pagamento, logística e termos",
    href: "/atelier/conta/configuracoes",
    icon: Settings2,
  },
  {
    title: "Financeiro",
    description: "Faturamento e statements mensais",
    href: "/atelier/financeiro",
    icon: Receipt,
  },
  {
    title: "Plano e assinatura",
    description: "Gerencie seu plano atual",
    href: "/atelier/conta/plano",
    icon: CreditCard,
  },
  {
    title: "Perfil",
    description: "Seus dados pessoais",
    href: "/atelier/conta/perfil",
    icon: User,
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

      <Plate>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-semibold">
              Notificações push
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Receba alertas mesmo com o navegador fechado
            </p>
          </div>
          <PushSubscribeButton />
        </div>
      </Plate>

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
