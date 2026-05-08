"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  documentIdSchema,
  uploadRetailerDocumentSchema,
} from "@/lib/validators/retailer-documents";
import type { ActionResult } from "@/types/actions";

const DOCUMENTS_PATH = "/lojista/conta/documentos";

export async function listRetailerDocuments() {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("retailer_documents")
    .select(
      "id, doc_type, file_name, storage_path, uploaded_by, uploaded_at, verified_at, verified_by",
    )
    .eq("retailer_id", tenantId)
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function uploadRetailerDocument(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const file = formData.get("file") as File | null;
    const docType = formData.get("doc_type") as string | null;

    if (!file) return { success: false, error: "Arquivo é obrigatório" };

    const parsed = uploadRetailerDocumentSchema.safeParse({
      doc_type: docType,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const ext = file.name.split(".").pop() ?? "bin";
    const storagePath = `${tenantId}/${parsed.data.doc_type}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("retailer-documents")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Erro no upload: ${uploadError.message}`,
      };
    }

    const { data: doc, error: dbError } = await supabase
      .from("retailer_documents")
      .insert({
        retailer_id: tenantId,
        doc_type: parsed.data.doc_type,
        file_name: file.name,
        storage_path: storagePath,
        uploaded_by: user.id,
      })
      .select("id")
      .single();

    if (dbError) {
      await supabase.storage.from("retailer-documents").remove([storagePath]);
      return { success: false, error: dbError.message };
    }

    revalidatePath(DOCUMENTS_PATH);
    return { success: true, data: { id: doc.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deleteRetailerDocument(
  docId: string,
): Promise<ActionResult> {
  try {
    const parsed = documentIdSchema.safeParse(docId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: doc, error: fetchError } = await supabase
      .from("retailer_documents")
      .select("id, storage_path")
      .eq("id", parsed.data)
      .eq("retailer_id", tenantId)
      .single();

    if (fetchError || !doc) {
      return {
        success: false,
        error: "Documento não encontrado ou sem permissão",
      };
    }

    await supabase.storage
      .from("retailer-documents")
      .remove([doc.storage_path]);

    const { error: deleteError } = await supabase
      .from("retailer_documents")
      .delete()
      .eq("id", doc.id);

    if (deleteError) return { success: false, error: deleteError.message };

    revalidatePath(DOCUMENTS_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function getDocumentSignedUrl(
  docId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const parsed = documentIdSchema.safeParse(docId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireRetailerAccess();
    const supabase = await createClient();

    const { data: doc, error: fetchError } = await supabase
      .from("retailer_documents")
      .select("storage_path")
      .eq("id", parsed.data)
      .single();

    if (fetchError || !doc) {
      return { success: false, error: "Documento não encontrado" };
    }

    const { data, error } = await supabase.storage
      .from("retailer-documents")
      .createSignedUrl(doc.storage_path, 3600);

    if (error) return { success: false, error: error.message };

    return { success: true, data: { url: data.signedUrl } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
