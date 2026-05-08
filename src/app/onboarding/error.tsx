"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-heading text-2xl font-semibold">Erro no cadastro</h2>
      <p className="text-muted-foreground max-w-md text-center text-sm">
        Ocorreu um erro durante o processo de cadastro. Tente novamente.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
