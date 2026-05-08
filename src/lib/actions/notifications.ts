"use server";

import { createClient } from "@/lib/supabase/server";
import {
  notificationIdSchema,
  listNotificationsSchema,
  type ListNotificationsInput,
} from "@/lib/validators/notifications";
import type { ActionResult } from "@/types/actions";

export async function listMyNotifications(filters?: ListNotificationsInput) {
  const parsed = listNotificationsSchema.safeParse(filters ?? {});
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const page = parsed.data.page ?? 0;
  const pageSize = 50;

  let query = supabase
    .from("notifications")
    .select("id, type, title, body, link, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (parsed.data.unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(
  notificationId: string,
): Promise<ActionResult> {
  try {
    const parsed = notificationIdSchema.safeParse(notificationId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
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

export async function markAllAsRead(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) return { success: false, error: error.message };

    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<ActionResult> {
  try {
    const parsed = notificationIdSchema.safeParse(notificationId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("notifications")
      .delete()
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
