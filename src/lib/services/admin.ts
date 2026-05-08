"use server";

import { createClient } from "@/lib/supabase/server";
import type { AppMetadata, Role } from "@/lib/auth/permissions";

export async function requireAdmin(): Promise<{
  userId: string;
  role: Role;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const metadata = user.app_metadata as AppMetadata | undefined;
  const role = metadata?.active_role;

  if (role !== "admin") {
    throw new Error("Acesso restrito a administradores");
  }

  return { userId: user.id, role };
}

export const requireAdminAccess = requireAdmin;
