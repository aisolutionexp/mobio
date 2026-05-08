import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Package,
  FileText,
  ShoppingBag,
  Store,
  MessageSquare,
  Receipt,
  Settings,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { resolveShell, type AppMetadata } from "@/lib/auth/permissions";
import type { NavItem } from "@/components/editorial/numbered-nav";
import { AtelierShell } from "./atelier-shell";

const ATELIER_NAV: NavItem[] = [
  {
    number: "01",
    label: "Salão",
    href: "/atelier/salao",
    icon: LayoutDashboard,
  },
  { number: "02", label: "Coleções", href: "/atelier/catalogo", icon: Layers },
  { number: "03", label: "Produtos", href: "/atelier/produtos", icon: Package },
  {
    number: "04",
    label: "Linesheet",
    href: "/atelier/linesheet",
    icon: FileText,
  },
  {
    number: "05",
    label: "Pedidos",
    href: "/atelier/pedidos",
    icon: ShoppingBag,
  },
  { number: "06", label: "Lojistas", href: "/atelier/lojistas", icon: Store },
  {
    number: "07",
    label: "Mensagens",
    href: "/atelier/mensagens",
    icon: MessageSquare,
  },
  {
    number: "08",
    label: "Financeiro",
    href: "/atelier/financeiro",
    icon: Receipt,
  },
  {
    number: "09",
    label: "Configurações",
    href: "/atelier/conta",
    icon: Settings,
  },
];

export default async function AtelierLayout({
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

  if (shell !== "atelier" && shell !== "admin") {
    redirect("/entrar");
  }

  return <AtelierShell items={ATELIER_NAV}>{children}</AtelierShell>;
}
