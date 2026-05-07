"use client";

import { AppShell } from "@/components/shared/app-shell";
import type { NavItem } from "@/components/editorial/numbered-nav";

export function AtelierShell({
  items,
  children,
}: {
  items: NavItem[];
  children: React.ReactNode;
}) {
  return <AppShell items={items}>{children}</AppShell>;
}
