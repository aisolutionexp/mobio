"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { NumberedNav, type NavItem } from "@/components/editorial/numbered-nav";

interface AppShellProps {
  items: NavItem[];
  topbarCenter?: React.ReactNode;
  topbarActions?: React.ReactNode;
  children: React.ReactNode;
}

function AppShell({
  items,
  topbarCenter,
  topbarActions,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  React.useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const drawer = drawerRef.current;
    if (drawer) {
      const firstFocusable = drawer.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const closeDrawer = React.useCallback(() => {
    setDrawerOpen(false);
    triggerRef.current?.focus();
  }, []);

  const sidebarHeader = (
    <Link
      href="/"
      className="font-heading text-foreground text-lg font-bold tracking-wider"
    >
      MOBIO
    </Link>
  );

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="border-border bg-sidebar hidden w-60 shrink-0 border-r lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <NumberedNav
            items={items}
            activeHref={pathname}
            header={sidebarHeader}
          />
        </div>
      </aside>

      {/* Sidebar — tablet (collapsed, icons + numbers only) */}
      <aside className="border-border bg-sidebar hidden w-16 shrink-0 border-r md:block lg:hidden">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="px-3 py-4">
            <Link
              href="/"
              className="font-heading text-foreground text-sm font-bold tracking-wider"
            >
              M
            </Link>
          </div>
          <nav aria-label="Menu principal" className="flex-1 space-y-1 px-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  title={item.label}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-md px-1 py-2 text-[10px] font-medium transition-colors",
                    isActive
                      ? "border-accent bg-sidebar-accent text-foreground border-l-2"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-l-2 border-transparent",
                  )}
                >
                  {ItemIcon ? (
                    <ItemIcon aria-hidden="true" className="size-4" />
                  ) : (
                    <span className="font-heading text-muted-foreground text-xs tracking-wider">
                      {item.number}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-drawer-title"
          className="fixed inset-0 z-50 md:hidden"
        >
          <div
            className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside className="border-border bg-sidebar absolute inset-y-0 left-0 w-[280px] border-r shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-4">
                <Link
                  id="mobile-drawer-title"
                  href="/"
                  className="font-heading text-foreground text-lg font-bold tracking-wider"
                >
                  MOBIO
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar menu"
                  onClick={closeDrawer}
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
              <div onClickCapture={closeDrawer}>
                <NumberedNav items={items} activeHref={pathname} />
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="border-border bg-background/80 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-sm md:px-6">
          {/* Mobile hamburger */}
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>

          {/* Logo (visible on mobile + tablet, hidden on desktop where sidebar shows it) */}
          <Link
            href="/"
            className="font-heading text-foreground text-lg font-bold tracking-wider lg:hidden"
          >
            MOBIO
          </Link>

          {/* Center area (breadcrumb or search) */}
          <div className="hidden flex-1 md:block">{topbarCenter}</div>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {topbarActions}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificações"
              className="hidden md:inline-flex"
            >
              <Bell aria-hidden="true" />
            </Button>
            <Avatar
              alt="Usuário"
              fallback="U"
              size="sm"
              className="cursor-pointer"
            />
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export { AppShell };
export type { AppShellProps };
