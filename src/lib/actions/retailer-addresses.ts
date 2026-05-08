"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import { retailerAddressSchema } from "@/lib/validators/retailer-addresses";
import type { ActionResult } from "@/types/actions";

const ADDRESSES_PATH = "/lojista/conta/enderecos";

export async function listRetailerAddresses() {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("retailer_addresses")
    .select(
      "id, label, recipient_name, address_line, complement, neighborhood, city, state, zip_code, is_default, created_at",
    )
    .eq("retailer_id", tenantId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, 49);

  if (error) throw new Error(error.message);
  return data;
}

export async function addRetailerAddress(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = retailerAddressSchema.safeParse({
      label: formData.get("label"),
      recipient_name: formData.get("recipient_name"),
      address_line: formData.get("address_line"),
      complement: formData.get("complement") || undefined,
      neighborhood: formData.get("neighborhood"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip_code: formData.get("zip_code"),
      region_id: formData.get("region_id") || undefined,
      is_default: formData.get("is_default") === "true",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    if (parsed.data.is_default) {
      await supabase
        .from("retailer_addresses")
        .update({ is_default: false })
        .eq("retailer_id", tenantId)
        .eq("is_default", true);
    }

    const { data, error } = await supabase
      .from("retailer_addresses")
      .insert({
        retailer_id: tenantId,
        label: parsed.data.label,
        recipient_name: parsed.data.recipient_name,
        address_line: parsed.data.address_line,
        complement: parsed.data.complement ?? null,
        neighborhood: parsed.data.neighborhood,
        city: parsed.data.city,
        state: parsed.data.state,
        zip_code: parsed.data.zip_code,
        region_id: parsed.data.region_id ?? null,
        is_default: parsed.data.is_default ?? false,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(ADDRESSES_PATH);
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateRetailerAddress(
  addressId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const parsed = retailerAddressSchema.safeParse({
      label: formData.get("label"),
      recipient_name: formData.get("recipient_name"),
      address_line: formData.get("address_line"),
      complement: formData.get("complement") || undefined,
      neighborhood: formData.get("neighborhood"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip_code: formData.get("zip_code"),
      region_id: formData.get("region_id") || undefined,
      is_default: formData.get("is_default") === "true",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    if (parsed.data.is_default) {
      await supabase
        .from("retailer_addresses")
        .update({ is_default: false })
        .eq("retailer_id", tenantId)
        .eq("is_default", true);
    }

    const { error } = await supabase
      .from("retailer_addresses")
      .update({
        label: parsed.data.label,
        recipient_name: parsed.data.recipient_name,
        address_line: parsed.data.address_line,
        complement: parsed.data.complement ?? null,
        neighborhood: parsed.data.neighborhood,
        city: parsed.data.city,
        state: parsed.data.state,
        zip_code: parsed.data.zip_code,
        region_id: parsed.data.region_id ?? null,
        is_default: parsed.data.is_default ?? false,
      })
      .eq("id", addressId)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(ADDRESSES_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deleteRetailerAddress(
  addressId: string,
): Promise<ActionResult> {
  try {
    const { tenantId, role } = await requireRetailerAccess();

    if (role !== "lojista_owner" && role !== "admin") {
      return {
        success: false,
        error: "Apenas o proprietário pode remover endereços",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("retailer_addresses")
      .delete()
      .eq("id", addressId)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(ADDRESSES_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function setDefaultAddress(
  addressId: string,
): Promise<ActionResult> {
  try {
    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    await supabase
      .from("retailer_addresses")
      .update({ is_default: false })
      .eq("retailer_id", tenantId)
      .eq("is_default", true);

    const { error } = await supabase
      .from("retailer_addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(ADDRESSES_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
