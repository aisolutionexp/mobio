"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="bg-background text-foreground ring-ring fixed top-2 left-2 z-[100] -translate-y-full rounded-md px-4 py-2 text-sm font-medium shadow-lg transition-transform focus:translate-y-0 focus:ring-2 focus:outline-none"
    >
      Pular para conteúdo principal
    </a>
  );
}
