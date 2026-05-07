import { createClient } from "@/lib/supabase/server";
import type { AppMetadata, Role } from "@/lib/auth/permissions";

export async function getActiveTenantId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const metadata = user.app_metadata as AppMetadata | undefined;
  const tenantId = metadata?.active_tenant_id;

  if (!tenantId) throw new Error("Nenhum tenant ativo");

  return tenantId;
}

export async function getActiveRole(): Promise<Role> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const metadata = user.app_metadata as AppMetadata | undefined;
  const role = metadata?.active_role;

  if (!role) throw new Error("Nenhum role ativo");

  return role;
}

export async function requireFactoryAccess(): Promise<{
  tenantId: string;
  role: Role;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const metadata = user.app_metadata as AppMetadata | undefined;
  const role = metadata?.active_role;
  const tenantId = metadata?.active_tenant_id;

  if (!role || !tenantId) throw new Error("Sessão inválida");

  if (
    role !== "atelier_owner" &&
    role !== "atelier_member" &&
    role !== "admin"
  ) {
    throw new Error("Acesso restrito a membros do atelier");
  }

  return { tenantId, role };
}
