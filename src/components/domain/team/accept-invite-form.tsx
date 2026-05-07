"use client";

import * as React from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Plate } from "@/components/editorial/plate";

export function AcceptInviteForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("full_name") as string;

    if (!fullName || fullName.length < 2) {
      setError("Nome deve ter ao menos 2 caracteres");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: fnError } = await supabase.functions.invoke(
        "accept-invite",
        {
          body: { token, email, full_name: fullName },
        },
      );

      if (fnError) {
        setError("Erro ao aceitar convite. Tente novamente.");
        setLoading(false);
        return;
      }

      if (!data?.ok) {
        setError(data?.error ?? "Erro ao aceitar convite");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Convite aceito! Verifique seu email para acessar.");
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Plate className="text-center">
        <div className="space-y-4 py-4">
          <h3 className="font-heading text-lg font-semibold">Convite aceito</h3>
          <p className="text-muted-foreground text-sm">
            Enviamos um link de acesso para <strong>{email}</strong>. Verifique
            sua caixa de entrada.
          </p>
        </div>
      </Plate>
    );
  }

  return (
    <Plate>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput name="email_display" label="Email" value={email} disabled />

        <TextInput
          name="full_name"
          label="Seu nome"
          placeholder="Nome completo"
          required
          minLength={2}
          maxLength={100}
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          variant="accent"
          loading={loading}
          className="w-full"
        >
          Aceitar convite
        </Button>
      </form>
    </Plate>
  );
}
