"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RetailerPaginationProps {
  total: number;
  page: number;
  pageSize: number;
}

export function RetailerPagination({
  total,
  page,
  pageSize,
}: RetailerPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p > 1) {
      params.set("page", String(p));
    } else {
      params.delete("page");
    }
    router.push(`/admin/lojistas?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        {total} lojista{total !== 1 ? "s" : ""} encontrado
        {total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>
        <span className="text-muted-foreground px-2 text-sm">
          {page} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  );
}
