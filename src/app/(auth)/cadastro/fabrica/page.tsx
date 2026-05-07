"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  signupFactorySchema,
  type SignupFactoryFormData,
} from "@/lib/validators/auth";
import {
  AuthShell,
  AuthFooterLinks,
} from "@/components/domain/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Option = { id: string; name: string };

export default function SignupFactoryPage() {
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
  } = useForm<SignupFactoryFormData>({
    resolver: zodResolver(signupFactorySchema),
    defaultValues: { categories: [] },
  });

  const selectedCategories = watch("categories");

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

  function toggleCategory(id: string) {
    const current = selectedCategories ?? [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    setValue("categories", next, { shouldValidate: true });
  }

  async function onSubmit(data: SignupFactoryFormData) {
    if (pending) return;
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.functions.invoke("signup-factory", {
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
          <h2 className="text-lg font-semibold">Cadastro de Ateliê</h2>
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
                placeholder="contato@atelier.com"
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
              <Label htmlFor="factory_name">Nome do Ateliê</Label>
              <Input
                id="factory_name"
                placeholder="Nome do ateliê ou fábrica"
                {...register("factory_name")}
                aria-invalid={!!errors.factory_name}
              />
              {errors.factory_name && (
                <p className="text-destructive text-sm">
                  {errors.factory_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
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
              <Label>Categorias</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const selected = selectedCategories?.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.id)}
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
                    Carregando categorias...
                  </p>
                )}
              </div>
              {errors.categories && (
                <p className="text-destructive text-sm">
                  {errors.categories.message}
                </p>
              )}
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
              href: "/cadastro/lojista",
              label: "Sou loja → Criar conta de lojista",
            },
          ]}
        />
      </div>
    </AuthShell>
  );
}
