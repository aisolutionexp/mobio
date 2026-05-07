"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  number: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface NumberedNavProps {
  items: NavItem[];
  activeHref: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function NumberedNav({
  items,
  activeHref,
  header,
  footer,
  className,
}: NumberedNavProps) {
  return (
    <nav
      aria-label="Menu principal"
      className={cn("flex h-full flex-col", className)}
    >
      {header && <div className="px-4 py-4">{header}</div>}

      <ul role="list" className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          const ItemIcon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-accent bg-sidebar-accent text-foreground border-l-2"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-l-2 border-transparent",
                )}
              >
                <span className="font-heading text-muted-foreground w-5 shrink-0 text-xs font-normal tracking-wider">
                  {item.number}
                </span>
                {ItemIcon && (
                  <ItemIcon aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && (
                  <Badge variant="accent" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {footer && (
        <>
          <hr className="border-border mx-4" />
          <div className="px-4 py-4">{footer}</div>
        </>
      )}
    </nav>
  );
}

export { NumberedNav };
export type { NumberedNavProps, NavItem };
