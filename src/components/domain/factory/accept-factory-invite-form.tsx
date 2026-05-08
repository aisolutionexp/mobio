"use client";

import * as React from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Plate } from "@/components/editorial/plate";

export function AcceptFactoryInviteForm({
  token,
  retailerEmail,
}: {
  token: string;
  retailerEmail: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email) {
      setError("Email é obrigatório");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: fnError } = await supabase.functions.invoke(
        "accept-factory-invitation",
        {
          body: { token, email },
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
      toast.success("Autorização aceita com sucesso!");
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
          <h3 className="font-heading text-lg font-semibold">
            Autorização aceita
          </h3>
          <p className="text-muted-foreground text-sm">
            Você agora é um lojista autorizado. Verifique seu email{" "}
            <strong>{retailerEmail}</strong> para instruções de acesso.
          </p>
        </div>
      </Plate>
    );
  }

  return (
    <Plate>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          name="email_display"
          label="Email do convite"
          value={retailerEmail}
          disabled
        />

        <TextInput
          name="email"
          label="Confirme seu email"
          type="email"
          placeholder="Seu email"
          required
          defaultValue={retailerEmail}
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          variant="accent"
          loading={loading}
          className="w-full"
        >
          Aceitar autorização
        </Button>
      </form>
    </Plate>
  );
}
