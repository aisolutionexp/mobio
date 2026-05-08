"use server";

import { createClient } from "@/lib/supabase/server";
import {
  subscriptionIdSchema,
  subscribeToPushSchema,
  type SubscribeToPushInput,
} from "@/lib/validators/push-subscriptions";
import type { ActionResult } from "@/types/actions";

export async function subscribeToPush(
  input: SubscribeToPushInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = subscribeToPushSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint: parsed.data.endpoint,
          p256dh: parsed.data.p256dh,
          auth: parsed.data.auth,
          user_agent: parsed.data.user_agent ?? null,
          is_active: true,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" },
      )
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function unsubscribeFromPush(
  subscriptionId: string,
): Promise<ActionResult> {
  try {
    const parsed = subscriptionIdSchema.safeParse(subscriptionId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("push_subscriptions")
      .update({ is_active: false })
      .eq("id", parsed.data)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function listMyPushSubscriptions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, user_agent, is_active, last_used_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
