"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { AppMetadata } from "@/lib/auth/permissions";

const slugSchema = z.string().min(1).max(200);
const uuidSchema = z.string().uuid();

export async function getFactoryBySlug(slug: string) {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("factories")
    .select(
      "id, name, slug, description, logo_path, cover_path, email, phone, website, region_id, regions(id, name)",
    )
    .eq("slug", parsed.data)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  const { data: categories } = await supabase
    .from("factory_categories")
    .select("categories(id, name, slug)")
    .eq("factory_id", data.id);

  return {
    ...data,
    regionName:
      (data.regions as { id: string; name: string } | null)?.name ?? null,
    categories: (categories ?? [])
      .map((fc) => fc.categories as { id: string; name: string; slug: string })
      .filter(Boolean),
  };
}

export async function isUserAuthorizedForFactory(factoryId: string): Promise<{
  authorized: boolean;
  userId: string | null;
  role: string | null;
}> {
  const parsed = uuidSchema.safeParse(factoryId);
  if (!parsed.success) return { authorized: false, userId: null, role: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false, userId: null, role: null };

  const metadata = user.app_metadata as AppMetadata | undefined;
  const activeRole = metadata?.active_role ?? null;
  const activeTenantId = metadata?.active_tenant_id;

  if (activeRole === "admin") {
    return { authorized: true, userId: user.id, role: activeRole };
  }

  if (activeRole === "atelier_owner" || activeRole === "atelier_member") {
    const { data: member } = await supabase
      .from("team_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("factory_id", parsed.data)
      .eq("is_active", true)
      .maybeSingle();

    if (member) {
      return { authorized: true, userId: user.id, role: activeRole };
    }
  }

  if (activeRole === "lojista_owner" || activeRole === "lojista_buyer") {
    if (activeTenantId) {
      const { data: authorization } = await supabase
        .from("authorized_retailers")
        .select("status")
        .eq("factory_id", parsed.data)
        .eq("retailer_id", activeTenantId)
        .eq("status", "active")
        .maybeSingle();

      if (authorization) {
        return { authorized: true, userId: user.id, role: activeRole };
      }
    }
  }

  return { authorized: false, userId: user.id, role: activeRole };
}
