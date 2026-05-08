"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRetailerAccess } from "@/lib/services/active-tenant";
import {
  slotIdSchema,
  bookingIdSchema,
  bookSlotSchema,
} from "@/lib/validators/showrooms";
import { notifyPushFireAndForget } from "@/lib/services/notify-push";
import type { ActionResult } from "@/types/actions";

const SHOWROOM_PATH = "/lojista/showroom";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function notifyShowroomBooking(
  supabase: SupabaseClient,
  slot: { showroom_id: string },
  retailerTenantId: string,
  userId: string,
) {
  const { data: showroom } = await supabase
    .from("showrooms")
    .select("name, factory_id")
    .eq("id", slot.showroom_id)
    .single();

  if (!showroom) return;

  const { data: retailer } = await supabase
    .from("retailers")
    .select("name")
    .eq("id", retailerTenantId)
    .single();

  const { data: factoryMembers } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("factory_id", showroom.factory_id)
    .eq("role", "atelier_owner")
    .eq("is_active", true);

  if (factoryMembers) {
    const notifications = factoryMembers.map((m) => ({
      user_id: m.user_id,
      type: "showroom_booking",
      title: "Nova reserva em showroom",
      body: `${retailer?.name ?? "Um lojista"} reservou um horário em "${showroom.name}"`,
      link: `/atelier/showroom/${slot.showroom_id}`,
    }));

    await supabase.from("notifications").insert(notifications);
    for (const n of notifications) {
      notifyPushFireAndForget(n.user_id, {
        title: n.title,
        body: n.body,
        url: n.link,
      });
    }
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "showroom_booking",
    title: "Reserva confirmada",
    body: `Sua visita ao showroom "${showroom.name}" foi agendada`,
    link: SHOWROOM_PATH,
  });
  notifyPushFireAndForget(userId, {
    title: "Reserva confirmada",
    body: `Sua visita ao showroom "${showroom.name}" foi agendada`,
    url: SHOWROOM_PATH,
  });
}

export async function listAvailableShowrooms() {
  await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showrooms")
    .select(
      "id, name, type, description, event_date, location, capacity, status, factory_id, factories(id, name, slug, logo_path)",
    )
    .in("status", ["published", "active"])
    .order("event_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function listAvailableSlots(showroomId: string) {
  await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showroom_slots")
    .select(
      "id, showroom_id, starts_at, ends_at, max_attendees, is_available, location_details",
    )
    .eq("showroom_id", showroomId)
    .eq("is_available", true)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function listRetailerBookings() {
  const { tenantId } = await requireRetailerAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showroom_bookings")
    .select(
      "id, slot_id, retailer_id, status, notes, confirmed_at, created_at, showroom_slots(id, showroom_id, starts_at, ends_at, location_details, showrooms(id, name, type, location, factories(id, name, slug)))",
    )
    .eq("retailer_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function bookShowroomSlot(
  slotId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const idParsed = slotIdSchema.safeParse(slotId);
    if (!idParsed.success) {
      return { success: false, error: idParsed.error.issues[0].message };
    }

    const parsed = bookSlotSchema.safeParse({
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: slot, error: slotError } = await supabase
      .from("showroom_slots")
      .select("id, is_available, showroom_id")
      .eq("id", idParsed.data)
      .single();

    if (slotError || !slot) {
      return { success: false, error: "Slot não encontrado" };
    }

    if (!slot.is_available) {
      return { success: false, error: "Este horário não está mais disponível" };
    }

    const { error: insertError } = await supabase
      .from("showroom_bookings")
      .insert({
        slot_id: idParsed.data,
        retailer_id: tenantId,
        notes: parsed.data.notes ?? null,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return { success: false, error: "Você já reservou este horário" };
      }
      return { success: false, error: insertError.message };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      notifyShowroomBooking(supabase, slot, tenantId, user.id);
    }

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function cancelMyBooking(
  bookingId: string,
): Promise<ActionResult> {
  try {
    const parsed = bookingIdSchema.safeParse(bookingId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { tenantId } = await requireRetailerAccess();
    const supabase = await createClient();

    const { data: booking, error: fetchError } = await supabase
      .from("showroom_bookings")
      .select("status, retailer_id")
      .eq("id", parsed.data)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: "Reserva não encontrada" };
    }

    if (booking.retailer_id !== tenantId) {
      return { success: false, error: "Sem permissão" };
    }

    if (booking.status === "cancelled") {
      return { success: false, error: "Reserva já está cancelada" };
    }

    if (booking.status !== "pending") {
      return {
        success: false,
        error: "Apenas reservas pendentes podem ser canceladas",
      };
    }

    const { error } = await supabase
      .from("showroom_bookings")
      .update({ status: "cancelled" })
      .eq("id", parsed.data)
      .eq("retailer_id", tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath(SHOWROOM_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
