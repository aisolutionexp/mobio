"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
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
      <h2 className="font-heading text-2xl font-semibold">Erro no Admin</h2>
      <p className="text-muted-foreground max-w-md text-center text-sm">
        Ocorreu um erro inesperado. Se o problema persistir, entre em contato
        com o suporte.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
