"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOnboardingProfile } from "@/lib/actions/onboarding";

export function ProfileStep() {
  const [state, formAction, pending] = useActionState(
    updateOnboardingProfile,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
    if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Seu perfil
        </h1>
        <p className="text-muted-foreground text-sm">
          Como você gostaria de ser chamado na plataforma?
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="text-sm font-medium">
            Nome de exibição
          </label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="Seu nome"
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefone <span className="text-muted-foreground">(opcional)</span>
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            maxLength={20}
          />
        </div>

        {state && !state.success && (
          <p className="text-destructive text-sm">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Continuar"}
        </Button>
      </form>
    </div>
  );
}
