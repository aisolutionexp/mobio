import { redirect } from "next/navigation";
import {
  Store,
  Compass,
  LayoutGrid,
  FileText,
  Heart,
  ShoppingBag,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { resolveShell, type AppMetadata } from "@/lib/auth/permissions";
import type { NavItem } from "@/components/editorial/numbered-nav";
import { LojistaShell } from "./lojista-shell";

const LOJISTA_NAV: NavItem[] = [
  { number: "01", label: "Praça", href: "/lojista/praca", icon: Store },
  {
    number: "02",
    label: "Descobrir",
    href: "/lojista/descobrir",
    icon: Compass,
  },
  { number: "03", label: "Boards", href: "/lojista/boards", icon: LayoutGrid },
  {
    number: "04",
    label: "Linesheet",
    href: "/lojista/linesheet",
    icon: FileText,
  },
  { number: "05", label: "Favoritos", href: "/lojista/favoritos", icon: Heart },
  {
    number: "06",
    label: "Pedidos",
    href: "/lojista/pedidos",
    icon: ShoppingBag,
  },
  { number: "07", label: "Conta", href: "/lojista/conta", icon: User },
];

export default async function LojistaLayout({
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

  if (shell !== "lojista" && shell !== "admin") {
    redirect("/entrar");
  }

  return <LojistaShell items={LOJISTA_NAV}>{children}</LojistaShell>;
}
