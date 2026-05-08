"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getActiveTenantId, getActiveRole } from "@/lib/services/active-tenant";
import {
  conversationIdSchema,
  getOrCreateConversationSchema,
  sendMessageSchema,
  searchMessagesSchema,
} from "@/lib/validators/conversations";
import type { ActionResult } from "@/types/actions";
import type { Role } from "@/lib/auth/permissions";

function isFactoryRole(role: Role) {
  return role === "atelier_owner" || role === "atelier_member";
}

function isRetailerRole(role: Role) {
  return role === "lojista_owner" || role === "lojista_buyer";
}

function shellPath(role: Role) {
  return isFactoryRole(role) ? "/atelier/mensagens" : "/lojista/mensagens";
}

export type ConversationPreview = {
  id: string;
  factory_id: string;
  retailer_id: string;
  context_type: string | null;
  context_id: string | null;
  status: string;
  last_message_at: string | null;
  created_at: string;
  counterpart_name: string;
  counterpart_logo: string | null;
  last_message_body: string | null;
  unread_count: number;
};

export async function listMyConversations(): Promise<ConversationPreview[]> {
  const tenantId = await getActiveTenantId();
  const role = await getActiveRole();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const isFactory = isFactoryRole(role);

  const { data: rpcRows, error: rpcError } = await supabase.rpc(
    "list_my_conversations",
    { p_user_id: user.id },
  );

  if (rpcError) throw new Error(rpcError.message);
  if (!rpcRows || rpcRows.length === 0) return [];

  const counterpartIds = rpcRows.map(
    (r: { factory_id: string; retailer_id: string }) =>
      isFactory ? r.retailer_id : r.factory_id,
  );
  const counterpartTable = isFactory ? "retailers" : "factories";

  const { data: counterparts } = await supabase
    .from(counterpartTable)
    .select("id, name, logo_path")
    .in("id", counterpartIds);

  const counterpartMap: Record<
    string,
    { name: string; logo_path: string | null }
  > = {};
  if (counterparts) {
    for (const cp of counterparts) {
      counterpartMap[cp.id] = { name: cp.name, logo_path: cp.logo_path };
    }
  }

  return rpcRows.map(
    (row: {
      conversation_id: string;
      factory_id: string;
      retailer_id: string;
      context_type: string | null;
      context_id: string | null;
      last_message_body: string | null;
      last_message_at: string | null;
      unread_count: number;
    }) => {
      const cpId = isFactory ? row.retailer_id : row.factory_id;
      const cp = counterpartMap[cpId];
      return {
        id: row.conversation_id,
        factory_id: row.factory_id,
        retailer_id: row.retailer_id,
        context_type: row.context_type,
        context_id: row.context_id,
        status: "active",
        last_message_at: row.last_message_at,
        created_at: row.last_message_at ?? "",
        counterpart_name: cp?.name ?? "Desconhecido",
        counterpart_logo: cp?.logo_path ?? null,
        last_message_body: row.last_message_body ?? null,
        unread_count: Number(row.unread_count),
      };
    },
  );
}

export async function getOrCreateConversation(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = getOrCreateConversationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { factory_id, retailer_id, context_type, context_id } = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado" };

  let query = supabase
    .from("conversations")
    .select("id")
    .eq("factory_id", factory_id)
    .eq("retailer_id", retailer_id);

  if (context_type && context_type !== "general" && context_id) {
    query = query.eq("context_type", context_type).eq("context_id", context_id);
  } else {
    query = query.or("context_type.is.null,context_type.eq.general");
  }

  const { data: existing } = await query.limit(1).single();

  if (existing) {
    return { success: true, data: { id: existing.id } };
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      factory_id,
      retailer_id,
      context_type: context_type ?? "general",
      context_id: context_id ?? null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, data: { id: created.id } };
}

export type ConversationMessage = {
  id: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender_user_id: string;
  attachments: Array<{
    id: string;
    file_name: string;
    file_type: string;
    file_size_bytes: number;
    storage_path: string;
  }>;
  profiles: {
    id: string;
    full_name: string;
    avatar_path: string | null;
  } | null;
};

export async function listConversationMessages(
  conversationId: string,
  page = 0,
): Promise<ConversationMessage[]> {
  const parsed = conversationIdSchema.safeParse(conversationId);
  if (!parsed.success) throw new Error("Conversa inválida");

  const supabase = await createClient();
  const pageSize = 50;

  const { data, error } = await supabase
    .from("messages")
    .select("id, body, is_read, created_at, sender_user_id")
    .eq("conversation_id", parsed.data)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw new Error(error.message);

  const messageIds = (data ?? []).map((m) => m.id);
  const senderIds = [...new Set((data ?? []).map((m) => m.sender_user_id))];

  const profileMap: Record<
    string,
    { id: string; full_name: string; avatar_path: string | null }
  > = {};
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_path")
      .in("id", senderIds);

    if (profiles) {
      for (const p of profiles) {
        profileMap[p.id] = p;
      }
    }
  }

  const attachmentMap: Record<
    string,
    Array<{
      id: string;
      file_name: string;
      file_type: string;
      file_size_bytes: number;
      storage_path: string;
    }>
  > = {};

  if (messageIds.length > 0) {
    const { data: attachments } = await supabase
      .from("message_attachments")
      .select(
        "id, message_id, file_name, file_type, file_size_bytes, storage_path",
      )
      .in("message_id", messageIds)
      .eq("message_type", "conversation");

    if (attachments) {
      for (const att of attachments) {
        if (!attachmentMap[att.message_id]) {
          attachmentMap[att.message_id] = [];
        }
        attachmentMap[att.message_id].push({
          id: att.id,
          file_name: att.file_name,
          file_type: att.file_type,
          file_size_bytes: att.file_size_bytes,
          storage_path: att.storage_path,
        });
      }
    }
  }

  return (data ?? []).map((msg) => ({
    id: msg.id,
    body: msg.body,
    is_read: msg.is_read,
    created_at: msg.created_at,
    sender_user_id: msg.sender_user_id,
    attachments: attachmentMap[msg.id] ?? [],
    profiles: profileMap[msg.sender_user_id] ?? null,
  }));
}

export async function sendMessage(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { conversation_id, body, attachment_ids } = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado" };

  const { data: msg, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      body,
      sender_user_id: user.id,
    })
    .select("id")
    .single();

  if (msgError) return { success: false, error: msgError.message };

  if (attachment_ids && attachment_ids.length > 0) {
    const { error: attError } = await supabase
      .from("message_attachments")
      .update({ message_id: msg.id })
      .in("id", attachment_ids)
      .eq("uploaded_by", user.id)
      .eq("message_type", "conversation");

    if (attError) {
      console.error("Erro ao vincular anexos:", attError.message);
    }
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversation_id);

  const role = await getActiveRole();
  revalidatePath(shellPath(role));

  return { success: true, data: { id: msg.id } };
}

export async function markMessagesAsRead(
  conversationId: string,
): Promise<ActionResult> {
  const parsed = conversationIdSchema.safeParse(conversationId);
  if (!parsed.success) {
    return { success: false, error: "Conversa inválida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado" };

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", parsed.data)
    .eq("is_read", false)
    .neq("sender_user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function searchMessages(input: unknown): Promise<
  ActionResult<
    Array<{
      id: string;
      body: string;
      conversation_id: string;
      created_at: string;
      sender_user_id: string;
    }>
  >
> {
  const parsed = searchMessagesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { query, conversation_id } = parsed.data;
  const supabase = await createClient();

  if (!conversation_id) {
    return {
      success: false,
      error: "conversation_id é obrigatório para busca",
    };
  }

  const { data, error } = await supabase.rpc("search_messages", {
    p_query: query,
    p_conversation_id: conversation_id,
  });

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: (data ?? []).map((m) => ({
      id: m.id,
      body: m.body,
      conversation_id: m.conversation_id,
      created_at: m.created_at,
      sender_user_id: m.sender_user_id,
    })),
  };
}

export async function getConversationDetails(conversationId: string) {
  const parsed = conversationIdSchema.safeParse(conversationId);
  if (!parsed.success) throw new Error("Conversa inválida");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, factory_id, retailer_id, context_type, context_id, status, last_message_at, factories(id, name, logo_path), retailers(id, name, logo_path)",
    )
    .eq("id", parsed.data)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
