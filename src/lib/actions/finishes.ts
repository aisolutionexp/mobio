"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { addFinishSchema } from "@/lib/validators/catalog";
import type { ActionResult } from "@/types/actions";

export async function listFinishes(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      is_active: boolean;
    }>
  >
> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("finishes")
      .select("id, name, description, is_active")
      .eq("factory_id", tenantId)
      .eq("is_active", true)
      .order("name");

    if (error) return { success: false, error: error.message };

    return { success: true, data: data ?? [] };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function addFinish(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = addFinishSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("finishes")
      .insert({
        factory_id: tenantId,
        name: parsed.data.name,
        description: parsed.data.description || null,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "Já existe um acabamento com esse nome",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function removeFinish(finishId: string): Promise<ActionResult> {
  try {
    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("finishes")
      .update({ is_active: false })
      .eq("id", finishId)
      .eq("factory_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/atelier/catalogo`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
