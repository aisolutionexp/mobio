"use client";

import { useActionState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { upsertFactorySettings } from "@/lib/actions/factory-settings";
import type { FactorySettingsData } from "@/lib/actions/factory-settings";
import {
  factorySettingsSchema,
  type FactorySettingsInput,
} from "@/lib/validators/factory-settings";
import { Plate } from "@/components/editorial/plate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldHint,
  FieldError,
} from "@/components/ui/field";

interface RegionOption {
  id: string;
  name: string;
  code: string;
}

interface FactorySettingsFormProps {
  initialData: FactorySettingsData;
  regions: RegionOption[];
  readOnly?: boolean;
}

const PAYMENT_MODES = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "cartao", label: "Cartão de crédito" },
] as const;

const SHIPPING_MODES = [
  { value: "correios", label: "Correios" },
  { value: "transportadora", label: "Transportadora" },
  { value: "retirada", label: "Retirada no local" },
] as const;

function centsToBrl(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function brlToCents(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned || "0") * 100);
}

export function FactorySettingsForm({
  initialData,
  regions,
  readOnly = false,
}: FactorySettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    upsertFactorySettings,
    null,
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FactorySettingsInput>({
    resolver: zodResolver(factorySettingsSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    if (state?.success) toast.success("Configurações salvas com sucesso");
    if (state && !state.success) toast.error(state.error);
  }, [state]);

  const onSubmit = useCallback(
    (data: FactorySettingsInput) => {
      const fd = new FormData();
      fd.set("settings", JSON.stringify(data));
      formAction(fd);
    },
    [formAction],
  );

  const selectedRegions = watch("shipping_policy.regioes_atendidas");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Plate eyebrow="Pagamento" title="Formas de pagamento">
        <div className="space-y-4">
          <Field>
            <FieldLabel>Modos aceitos</FieldLabel>
            <FieldControl>
              <Controller
                name="payment_terms.accepted_modes"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-3">
                    {PAYMENT_MODES.map((mode) => {
                      const checked =
                        field.value?.includes(mode.value) ?? false;
                      return (
                        <label
                          key={mode.value}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            disabled={readOnly}
                            checked={checked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(field.value ?? []), mode.value]
                                : (field.value ?? []).filter(
                                    (v) => v !== mode.value,
                                  );
                              field.onChange(updated);
                            }}
                            className="border-input accent-accent size-4 rounded"
                          />
                          {mode.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </FieldControl>
            <FieldError>
              {errors.payment_terms?.accepted_modes?.message}
            </FieldError>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel>Prazo padrão (dias)</FieldLabel>
              <FieldControl>
                <Input
                  type="number"
                  min={0}
                  max={180}
                  disabled={readOnly}
                  {...register("payment_terms.prazo_dias_default", {
                    valueAsNumber: true,
                  })}
                />
              </FieldControl>
              <FieldError>
                {errors.payment_terms?.prazo_dias_default?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel>Parcelas máx.</FieldLabel>
              <FieldControl>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  disabled={readOnly}
                  {...register("payment_terms.parcelas_max", {
                    valueAsNumber: true,
                  })}
                />
              </FieldControl>
              <FieldError>
                {errors.payment_terms?.parcelas_max?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel>Desconto à vista (%)</FieldLabel>
              <FieldControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  disabled={readOnly}
                  {...register("payment_terms.desconto_avista_pct", {
                    valueAsNumber: true,
                  })}
                />
              </FieldControl>
              <FieldError>
                {errors.payment_terms?.desconto_avista_pct?.message}
              </FieldError>
            </Field>
          </div>
        </div>
      </Plate>

      <Plate eyebrow="Logística" title="Política de envio">
        <div className="space-y-4">
          <Field>
            <FieldLabel>Modos de envio</FieldLabel>
            <FieldControl>
              <Controller
                name="shipping_policy.modes"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-3">
                    {SHIPPING_MODES.map((mode) => {
                      const checked =
                        field.value?.includes(mode.value) ?? false;
                      return (
                        <label
                          key={mode.value}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            disabled={readOnly}
                            checked={checked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(field.value ?? []), mode.value]
                                : (field.value ?? []).filter(
                                    (v) => v !== mode.value,
                                  );
                              field.onChange(updated);
                            }}
                            className="border-input accent-accent size-4 rounded"
                          />
                          {mode.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </FieldControl>
            <FieldError>{errors.shipping_policy?.modes?.message}</FieldError>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Prazo padrão (dias)</FieldLabel>
              <FieldControl>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  disabled={readOnly}
                  {...register("shipping_policy.prazo_padrao_dias", {
                    valueAsNumber: true,
                  })}
                />
              </FieldControl>
              <FieldError>
                {errors.shipping_policy?.prazo_padrao_dias?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel>Frete mínimo (R$)</FieldLabel>
              <FieldControl>
                <Controller
                  name="shipping_policy.frete_minimo_cents"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="decimal"
                      disabled={readOnly}
                      placeholder="0,00"
                      value={centsToBrl(field.value ?? 0)}
                      onChange={(e) =>
                        field.onChange(brlToCents(e.target.value))
                      }
                    />
                  )}
                />
              </FieldControl>
              <FieldHint>Valor em reais</FieldHint>
              <FieldError>
                {errors.shipping_policy?.frete_minimo_cents?.message}
              </FieldError>
            </Field>
          </div>

          {regions.length > 0 && (
            <Field>
              <FieldLabel>Regiões atendidas</FieldLabel>
              <FieldControl>
                <Controller
                  name="shipping_policy.regioes_atendidas"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {regions.map((region) => {
                        const checked =
                          field.value?.includes(region.id) ?? false;
                        return (
                          <label
                            key={region.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              disabled={readOnly}
                              checked={checked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...(field.value ?? []), region.id]
                                  : (field.value ?? []).filter(
                                      (v) => v !== region.id,
                                    );
                                field.onChange(updated);
                              }}
                              className="border-input accent-accent size-4 rounded"
                            />
                            {region.code} — {region.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
              </FieldControl>
              <FieldHint>
                {(selectedRegions?.length ?? 0) > 0
                  ? `${selectedRegions.length} região(ões) selecionada(s)`
                  : "Nenhuma região selecionada (atende todo o Brasil)"}
              </FieldHint>
            </Field>
          )}
        </div>
      </Plate>

      <Plate eyebrow="Termos" title="Condições comerciais">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Pedido mínimo (R$)</FieldLabel>
              <FieldControl>
                <Controller
                  name="commercial_terms.pedido_minimo_cents"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="decimal"
                      disabled={readOnly}
                      placeholder="0,00"
                      value={centsToBrl(field.value ?? 0)}
                      onChange={(e) =>
                        field.onChange(brlToCents(e.target.value))
                      }
                    />
                  )}
                />
              </FieldControl>
              <FieldHint>Valor em reais</FieldHint>
              <FieldError>
                {errors.commercial_terms?.pedido_minimo_cents?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel>Prazo de entrega (dias)</FieldLabel>
              <FieldControl>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  disabled={readOnly}
                  {...register("commercial_terms.prazo_entrega_dias", {
                    valueAsNumber: true,
                  })}
                />
              </FieldControl>
              <FieldError>
                {errors.commercial_terms?.prazo_entrega_dias?.message}
              </FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel>Observações</FieldLabel>
            <FieldControl>
              <Textarea
                disabled={readOnly}
                placeholder="Condições gerais, políticas de troca/devolução..."
                maxLength={2000}
                showCount
                autoResize
                {...register("commercial_terms.observacoes")}
              />
            </FieldControl>
            <FieldError>
              {errors.commercial_terms?.observacoes?.message}
            </FieldError>
          </Field>
        </div>
      </Plate>

      {!readOnly && (
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="accent"
            disabled={pending}
            leftIcon={<Save />}
          >
            {pending ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      )}
    </form>
  );
}
