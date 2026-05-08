"use server";

import { createClient } from "@/lib/supabase/server";
import {
  attachmentIdSchema,
  uploadAttachmentSchema,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "@/lib/validators/message-attachments";
import type { ActionResult } from "@/types/actions";

export async function uploadMessageAttachment(
  formData: FormData,
): Promise<ActionResult<{ id: string; storage_path: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado" };

  const file = formData.get("file") as File | null;
  const conversationId = formData.get("conversation_id") as string | null;

  if (!file) return { success: false, error: "Arquivo é obrigatório" };

  const parsed = uploadAttachmentSchema.safeParse({
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    conversation_id: conversationId,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${parsed.data.conversation_id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("message-attachments")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: `Erro no upload: ${uploadError.message}` };
  }

  const { data: attachment, error: dbError } = await supabase
    .from("message_attachments")
    .insert({
      message_id: "00000000-0000-0000-0000-000000000000",
      message_type: "conversation",
      storage_path: storagePath,
      file_name: file.name,
      file_type: file.type,
      file_size_bytes: file.size,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (dbError) {
    await supabase.storage.from("message-attachments").remove([storagePath]);
    return { success: false, error: dbError.message };
  }

  return {
    success: true,
    data: { id: attachment.id, storage_path: storagePath },
  };
}

export async function deleteMessageAttachment(
  attachmentId: string,
): Promise<ActionResult> {
  const parsed = attachmentIdSchema.safeParse(attachmentId);
  if (!parsed.success) {
    return { success: false, error: "Anexo inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado" };

  const { data: attachment, error: fetchError } = await supabase
    .from("message_attachments")
    .select("id, storage_path")
    .eq("id", parsed.data)
    .eq("uploaded_by", user.id)
    .single();

  if (fetchError || !attachment) {
    return { success: false, error: "Anexo não encontrado ou sem permissão" };
  }

  await supabase.storage
    .from("message-attachments")
    .remove([attachment.storage_path]);

  const { error: deleteError } = await supabase
    .from("message_attachments")
    .delete()
    .eq("id", attachment.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true, data: undefined };
}

export async function getAttachmentUrl(
  storagePath: string,
): Promise<ActionResult<{ url: string }>> {
  if (!storagePath) return { success: false, error: "Path inválido" };

  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("message-attachments")
    .createSignedUrl(storagePath, 3600);

  if (error) return { success: false, error: error.message };

  return { success: true, data: { url: data.signedUrl } };
}
