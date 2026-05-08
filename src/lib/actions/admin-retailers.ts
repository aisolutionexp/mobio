"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/services/admin";
import {
  verifyRetailerSchema,
  retailerFiltersSchema,
  type RetailerFilters,
} from "@/lib/validators/admin";
import type { ActionResult } from "@/types/actions";

const PAGE_SIZE = 20;

export interface RetailerRow {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  verification_status: string;
  verification_notes: string | null;
  verified_at: string | null;
  created_at: string;
  created_by: string;
  region: { name: string } | null;
}

export interface RetailerListResult {
  retailers: RetailerRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listRetailersForAdmin(
  filters?: Partial<RetailerFilters>,
): Promise<ActionResult<RetailerListResult>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const parsed = retailerFiltersSchema.safeParse(filters ?? {});
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { verification_status, query, page } = parsed.data;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let builder = supabase
      .from("retailers")
      .select(
        "id, name, slug, email, phone, verification_status, verification_notes, verified_at, created_at, created_by, region:regions(name)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (verification_status) {
      builder = builder.eq("verification_status", verification_status);
    }

    if (query) {
      builder = builder.or(
        `name.ilike.%${query}%,email.ilike.%${query}%,slug.ilike.%${query}%`,
      );
    }

    builder = builder.range(from, to);

    const { data, error, count } = await builder;

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        retailers: (data ?? []) as unknown as RetailerRow[],
        total: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function verifyRetailer(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    retailerId: formData.get("retailerId"),
    decision: formData.get("decision"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = verifyRetailerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { userId } = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("retailers")
      .update({
        verification_status: parsed.data.decision,
        verification_notes: parsed.data.notes ?? null,
        verified_at: new Date().toISOString(),
        verified_by: userId,
      })
      .eq("id", parsed.data.retailerId);

    if (error) return { success: false, error: error.message };

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/verify-retailer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              retailer_id: parsed.data.retailerId,
              decision: parsed.data.decision,
            }),
          });
        } catch {
          // Edge function notification is best-effort
        }
      }
    }

    revalidatePath("/admin/lojistas");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}

export async function requestVerification(
  retailerId: string,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Não autenticado" };

    const { error } = await supabase
      .from("retailers")
      .update({ verification_status: "pending" })
      .eq("id", retailerId)
      .eq("created_by", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/lojista/conta");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
