"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  signupRetailerSchema,
  type SignupRetailerFormData,
} from "@/lib/validators/auth";
import {
  AuthShell,
  AuthFooterLinks,
} from "@/components/domain/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Option = { id: string; name: string };

export default function SignupRetailerPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [regions, setRegions] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupRetailerFormData>({
    resolver: zodResolver(signupRetailerSchema),
    defaultValues: { segments: [] },
  });

  const selectedSegments = watch("segments");

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("regions")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setRegions(data);
      });

    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  function toggleSegment(id: string) {
    const current = selectedSegments ?? [];
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    setValue("segments", next, { shouldValidate: true });
  }

  async function onSubmit(data: SignupRetailerFormData) {
    if (pending) return;
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.functions.invoke("signup-retailer", {
        body: data,
      });

      if (error) {
        toast.error("Erro ao enviar cadastro. Tente novamente.");
        return;
      }

      setSent(true);
      reset();
      toast.success("Se o email for válido, enviamos um link de cadastro.");
    } catch {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Cadastro de Lojista</h2>
          <p className="text-muted-foreground text-sm">
            Preencha os dados para criar sua conta
          </p>
        </div>

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
              Cadastrar outro
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@loja.com"
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

            <div className="space-y-2">
              <Label htmlFor="retailer_name">Nome da Loja</Label>
              <Input
                id="retailer_name"
                placeholder="Nome da loja"
                {...register("retailer_name")}
                aria-invalid={!!errors.retailer_name}
              />
              {errors.retailer_name && (
                <p className="text-destructive text-sm">
                  {errors.retailer_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (opcional)</Label>
              <Input
                id="cnpj"
                placeholder="XX.XXX.XXX/XXXX-XX"
                {...register("cnpj")}
                aria-invalid={!!errors.cnpj}
              />
              {errors.cnpj && (
                <p className="text-destructive text-sm">
                  {errors.cnpj.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_name">Nome do Responsável</Label>
              <Input
                id="responsible_name"
                placeholder="Seu nome completo"
                {...register("responsible_name")}
                aria-invalid={!!errors.responsible_name}
              />
              {errors.responsible_name && (
                <p className="text-destructive text-sm">
                  {errors.responsible_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region_id">Região</Label>
              <select
                id="region_id"
                className="border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                defaultValue=""
                {...register("region_id")}
                aria-invalid={!!errors.region_id}
              >
                <option value="" disabled>
                  Selecione uma região
                </option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.region_id && (
                <p className="text-destructive text-sm">
                  {errors.region_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Segmentos de interesse (opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const selected = selectedSegments?.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleSegment(c.id)}
                      className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:bg-muted"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Carregando segmentos...
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(11) 99999-9999"
                {...register("whatsapp")}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={pending || isSubmitting}
            >
              {pending || isSubmitting ? "Enviando..." : "Criar conta"}
            </Button>
          </form>
        )}

        <AuthFooterLinks
          links={[
            { href: "/entrar", label: "Já tenho conta → Entrar" },
            {
              href: "/cadastro/fabrica",
              label: "Sou ateliê → Criar conta de ateliê",
            },
          ]}
        />
      </div>
    </AuthShell>
  );
}
