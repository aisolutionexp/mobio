"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mobio-lgpd-consent";

export function LgpdBanner() {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem(STORAGE_KEY);
  });

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="bg-card border-border fixed inset-x-0 bottom-0 z-50 border-t p-4 shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6"
    >
      <p className="text-foreground text-sm">
        Utilizamos cookies e tecnologias semelhantes para melhorar sua
        experiência. Ao continuar navegando, você concorda com nossa{" "}
        <Link
          href="/politica-de-privacidade"
          className="text-accent underline underline-offset-4"
        >
          Política de Privacidade
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2 sm:mt-0 sm:shrink-0">
        <Button size="sm" onClick={accept}>
          Aceitar
        </Button>
        <Button size="sm" variant="outline" onClick={decline}>
          Recusar
        </Button>
      </div>
    </div>
  );
}
