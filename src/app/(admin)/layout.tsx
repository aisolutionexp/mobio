import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Factory,
  ShieldCheck,
  Settings,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { resolveShell, type AppMetadata } from "@/lib/auth/permissions";
import type { NavItem } from "@/components/editorial/numbered-nav";
import { AdminShell } from "./admin-shell";

const ADMIN_NAV: NavItem[] = [
  {
    number: "01",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  { number: "02", label: "Lojistas", href: "/admin/lojistas", icon: Store },
  { number: "03", label: "Fábricas", href: "/admin/fabricas", icon: Factory },
  {
    number: "04",
    label: "Audit Log",
    href: "/admin/audit",
    icon: ShieldCheck,
  },
  {
    number: "05",
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const metadata = user.app_metadata as AppMetadata | undefined;
  const shell = resolveShell(metadata);

  if (shell !== "admin") {
    redirect("/entrar");
  }

  return <AdminShell items={ADMIN_NAV}>{children}</AdminShell>;
}
