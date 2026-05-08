"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { startOnboarding } from "@/lib/actions/onboarding";

export function WelcomeStep() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleStart = () => {
    startTransition(async () => {
      const result = await startOnboarding();
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Bem-vindo ao MOBIO
        </h1>
        <p className="text-muted-foreground max-w-md text-base">
          Vamos configurar sua conta em poucos passos para que você aproveite
          tudo que a plataforma tem a oferecer.
        </p>
      </div>
      <Button onClick={handleStart} disabled={pending} size="lg">
        {pending ? "Preparando..." : "Começar"}
      </Button>
    </div>
  );
}
