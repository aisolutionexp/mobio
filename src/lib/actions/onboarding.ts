"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

const profileStepSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  phone: z
    .string()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional(),
});

type OnboardingStep = "pending" | "profile" | "preferences" | "completed";

export async function startOnboarding(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_step: "profile" as string })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/onboarding");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateOnboardingProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = profileStepSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone ?? null,
        onboarding_step: "preferences" as string,
      })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/onboarding");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function completeOnboarding(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_step: "completed" as string,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/onboarding");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function getOnboardingStep(): Promise<OnboardingStep> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "pending";

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", user.id)
    .single();

  return (data?.onboarding_step as OnboardingStep) ?? "pending";
}
