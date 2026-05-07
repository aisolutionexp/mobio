"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import {
  AuthShell,
  AuthFooterLinks,
} from "@/components/domain/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    if (pending) return;
    setPending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setSent(true);
      toast.success("Se o email for válido, enviamos um link.");
    } catch {
      toast.error("Erro ao enviar o link. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-foreground text-sm">
              Verifique sua caixa de entrada. Se o email for válido, enviamos um
              link de acesso.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSent(false)}
            >
              Enviar novamente
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={pending || isSubmitting}
            >
              {pending || isSubmitting ? "Enviando..." : "Receber link"}
            </Button>
          </form>
        )}

        <AuthFooterLinks
          links={[
            { href: "/cadastro/lojista", label: "Sou loja → Criar conta" },
            {
              href: "/cadastro/fabrica",
              label: "Sou ateliê → Criar conta",
            },
          ]}
        />
      </div>
    </AuthShell>
  );
}
