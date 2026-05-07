export type Role =
  | "atelier_owner"
  | "atelier_member"
  | "lojista_owner"
  | "lojista_buyer"
  | "admin";

export type RoleEntry = {
  role: Role;
  tenant_id: string | null;
};

export type AppMetadata = {
  roles?: RoleEntry[];
  active_role?: Role;
  active_tenant_id?: string | null;
};

export type Shell = "atelier" | "lojista" | "admin";

export function hasRole(
  metadata: AppMetadata | undefined,
  role: Role,
): boolean {
  return metadata?.roles?.some((r) => r.role === role) ?? false;
}

export function canAccessTenant(
  metadata: AppMetadata | undefined,
  tenantId: string,
): boolean {
  return metadata?.roles?.some((r) => r.tenant_id === tenantId) ?? false;
}

export function isAdmin(metadata: AppMetadata | undefined): boolean {
  return hasRole(metadata, "admin");
}

export function isTenantOwner(
  metadata: AppMetadata | undefined,
  tenantId: string,
): boolean {
  return (
    metadata?.roles?.some(
      (r) =>
        r.tenant_id === tenantId &&
        (r.role === "atelier_owner" || r.role === "lojista_owner"),
    ) ?? false
  );
}

export function resolveShell(metadata: AppMetadata | undefined): Shell | null {
  const activeRole = metadata?.active_role;
  if (!activeRole) return null;

  if (activeRole === "admin") return "admin";
  if (activeRole.startsWith("atelier_")) return "atelier";
  if (activeRole.startsWith("lojista_")) return "lojista";

  return null;
}

export const ROLE_PATH_PREFIXES: Record<Role, string[]> = {
  atelier_owner: ["/atelier"],
  atelier_member: ["/atelier"],
  lojista_owner: ["/lojista"],
  lojista_buyer: ["/lojista"],
  admin: ["/admin", "/atelier", "/lojista"],
};

export const SHELL_HOME: Record<Shell, string> = {
  atelier: "/atelier",
  lojista: "/lojista",
  admin: "/admin",
};
