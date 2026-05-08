"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Plate } from "@/components/editorial/plate";
import { completeOnboarding } from "@/lib/actions/onboarding";

export function PreferencesStep() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeOnboarding();
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Preferências
        </h1>
        <p className="text-muted-foreground text-sm">
          Tudo pronto! No futuro, você poderá personalizar notificações e idioma
          aqui.
        </p>
      </div>

      <Plate title="Configurações">
        <p className="text-muted-foreground text-sm">
          Preferências de notificação e idioma estarão disponíveis em breve.
        </p>
      </Plate>

      <Button
        onClick={handleComplete}
        disabled={pending}
        className="w-full"
        size="lg"
      >
        {pending ? "Finalizando..." : "Concluir configuração"}
      </Button>
    </div>
  );
}
