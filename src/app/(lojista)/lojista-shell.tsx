"use client";

import { Search, FileText } from "lucide-react";

import { AppShell } from "@/components/shared/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NavItem } from "@/components/editorial/numbered-nav";

export function LojistaShell({
  items,
  children,
}: {
  items: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <AppShell
      items={items}
      topbarCenter={
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            placeholder="Buscar ateliês, produtos, coleções..."
            className="h-8 pl-8"
            aria-label="Buscar"
          />
        </div>
      }
      topbarActions={
        <Button variant="accent" size="sm" className="hidden md:inline-flex">
          <FileText
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Linesheet
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}
