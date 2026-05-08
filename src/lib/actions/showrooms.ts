"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import {
  showroomIdSchema,
  slotIdSchema,
  bookingIdSchema,
  createShowroomSchema,
  updateShowroomSchema,
  createSlotSchema,
  updateSlotSchema,
} from "@/lib/validators/showrooms";
import type { ActionResult } from "@/types/actions";

const SHOWROOM_PATH = "/atelier/showroom";

export async function listFactoryShowrooms() {
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showrooms")
    .select(
      "id, name, type, description, event_date, location, capacity, status, created_at",
    )
    .eq("factory_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getShowroom(showroomId: string) {
  const parsed = showroomIdSchema.safeParse(showroomId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showrooms")
    .select(
      "id, name, type, description, event_date, location, capacity, status, created_at",
    )
    .eq("id", parsed.data)
    .eq("factory_id", tenantId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createShowroom(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const raw = {
      name: formData.get("name"),
      type: formData.get("type"),
      description: formData.get("description") || undefined,
      event_date: formData.get("event_date") || undefined,
      location: formData.get("location") || undefined,
      capacity: formData.get("capacity") || undefined,
    };

    const parsed = createShowroomSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data, error } = await supabase
      .from("showrooms")
      .insert({
        factory_id: tenantId,
        created_by: user.id,
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description ?? null,
        event_date: parsed.data.event_date ?? null,
        location: parsed.data.location ?? null,
        capacity: parsed.data.capacity ?? null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateShowroom(
  showroomId: string,
  input: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const idParsed = showroomIdSchema.safeParse(showroomId);
    if (!idParsed.success) {
      return { success: false, error: idParsed.error.issues[0].message };
    }

    const parsed = updateShowroomSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("showrooms")
      .update(parsed.data)
      .eq("id", idParsed.data)
      .eq("factory_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    revalidatePath(`${SHOWROOM_PATH}/${showroomId}`);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deleteShowroom(
  showroomId: string,
): Promise<ActionResult> {
  try {
    const parsed = showroomIdSchema.safeParse(showroomId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("showrooms")
      .delete()
      .eq("id", parsed.data)
      .eq("factory_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function listShowroomSlots(showroomId: string) {
  const parsed = showroomIdSchema.safeParse(showroomId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showroom_slots")
    .select(
      "id, showroom_id, starts_at, ends_at, max_attendees, is_available, location_details, created_at",
    )
    .eq("showroom_id", parsed.data)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createSlot(
  showroomId: string,
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const idParsed = showroomIdSchema.safeParse(showroomId);
    if (!idParsed.success) {
      return { success: false, error: idParsed.error.issues[0].message };
    }

    const raw = {
      starts_at: formData.get("starts_at"),
      ends_at: formData.get("ends_at"),
      max_attendees: formData.get("max_attendees") || 1,
      location_details: formData.get("location_details") || undefined,
    };

    const parsed = createSlotSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("showroom_slots")
      .insert({
        showroom_id: idParsed.data,
        starts_at: parsed.data.starts_at,
        ends_at: parsed.data.ends_at,
        max_attendees: parsed.data.max_attendees,
        location_details: parsed.data.location_details ?? null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`${SHOWROOM_PATH}/${showroomId}`);
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function updateSlot(
  slotId: string,
  input: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const idParsed = slotIdSchema.safeParse(slotId);
    if (!idParsed.success) {
      return { success: false, error: idParsed.error.issues[0].message };
    }

    const parsed = updateSlotSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("showroom_slots")
      .update(parsed.data)
      .eq("id", idParsed.data);

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function deleteSlot(slotId: string): Promise<ActionResult> {
  try {
    const parsed = slotIdSchema.safeParse(slotId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const { error } = await supabase
      .from("showroom_slots")
      .delete()
      .eq("id", parsed.data);

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function listShowroomBookings(showroomId: string) {
  const parsed = showroomIdSchema.safeParse(showroomId);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await requireFactoryAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showroom_bookings")
    .select(
      "id, slot_id, retailer_id, status, notes, confirmed_at, created_at, showroom_slots!inner(showroom_id, starts_at, ends_at), retailers(id, name, slug, logo_path)",
    )
    .eq("showroom_slots.showroom_id", parsed.data)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function confirmBooking(bookingId: string): Promise<ActionResult> {
  try {
    const parsed = bookingIdSchema.safeParse(bookingId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const { data: booking, error: fetchError } = await supabase
      .from("showroom_bookings")
      .select("status")
      .eq("id", parsed.data)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    if (booking.status !== "pending") {
      return {
        success: false,
        error: "Apenas reservas pendentes podem ser confirmadas",
      };
    }

    const { error } = await supabase
      .from("showroom_bookings")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", parsed.data);

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  try {
    const parsed = bookingIdSchema.safeParse(bookingId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await requireFactoryAccess();
    const supabase = await createClient();

    const { data: booking, error: fetchError } = await supabase
      .from("showroom_bookings")
      .select("status")
      .eq("id", parsed.data)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    if (booking.status === "cancelled") {
      return { success: false, error: "Reserva já está cancelada" };
    }

    const { error } = await supabase
      .from("showroom_bookings")
      .update({ status: "cancelled" })
      .eq("id", parsed.data);

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
