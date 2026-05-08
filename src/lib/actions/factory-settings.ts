"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { factorySettingsSchema } from "@/lib/validators/factory-settings";
import type { ActionResult } from "@/types/actions";
import type {
  PaymentTerms,
  ShippingPolicy,
  CommercialTerms,
} from "@/lib/validators/factory-settings";

const SETTINGS_PATH = "/atelier/conta/configuracoes";

export interface FactorySettingsData {
  payment_terms: PaymentTerms;
  shipping_policy: ShippingPolicy;
  commercial_terms: CommercialTerms;
}

const DEFAULT_SETTINGS: FactorySettingsData = {
  payment_terms: {
    accepted_modes: [],
    prazo_dias_default: 30,
    parcelas_max: 1,
    desconto_avista_pct: 0,
  },
  shipping_policy: {
    modes: [],
    prazo_padrao_dias: 15,
    frete_minimo_cents: 0,
    regioes_atendidas: [],
  },
  commercial_terms: {
    pedido_minimo_cents: 0,
    prazo_entrega_dias: 30,
    observacoes: "",
  },
};

export async function getFactorySettings(): Promise<
  ActionResult<FactorySettingsData>
> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("factory_settings")
      .select("payment_terms, shipping_policy, commercial_terms")
      .eq("factory_id", tenantId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };

    if (!data) {
      return { success: true, data: DEFAULT_SETTINGS };
    }

    return {
      success: true,
      data: {
        payment_terms:
          (data.payment_terms as PaymentTerms) ??
          DEFAULT_SETTINGS.payment_terms,
        shipping_policy:
          (data.shipping_policy as ShippingPolicy) ??
          DEFAULT_SETTINGS.shipping_policy,
        commercial_terms:
          (data.commercial_terms as CommercialTerms) ??
          DEFAULT_SETTINGS.commercial_terms,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function upsertFactorySettings(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = formData.get("settings");
  if (!raw || typeof raw !== "string") {
    return { success: false, error: "Dados inválidos" };
  }

  let parsed;
  try {
    parsed = factorySettingsSchema.safeParse(JSON.parse(raw));
  } catch {
    return { success: false, error: "Dados inválidos" };
  }

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId, role } = await requireFactoryAccess();

    if (role !== "atelier_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode editar configurações",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("factory_settings").upsert(
      {
        factory_id: tenantId,
        payment_terms: parsed.data.payment_terms,
        shipping_policy: parsed.data.shipping_policy,
        commercial_terms: parsed.data.commercial_terms,
      },
      { onConflict: "factory_id" },
    );

    if (error) return { success: false, error: error.message };

    revalidatePath(SETTINGS_PATH);
    revalidatePath("/atelier/conta");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
