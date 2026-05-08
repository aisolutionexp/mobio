"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DiscoverSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const currentQuery = searchParams.get("q") ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string)?.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/lojista/praca?${params.toString()}`);
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/lojista/praca?${params.toString()}`);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative max-w-lg">
      <Search
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        name="q"
        type="search"
        defaultValue={currentQuery}
        placeholder="Buscar ateliês por nome..."
        className="pr-9 pl-9"
        aria-label="Buscar ateliês"
      />
      {currentQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
          aria-label="Limpar busca"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </form>
  );
}
