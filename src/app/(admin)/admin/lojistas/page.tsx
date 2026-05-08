import { Suspense } from "react";

import { Masthead } from "@/components/editorial/masthead";
import { Skeleton } from "@/components/ui/skeleton";
import { listRetailersForAdmin } from "@/lib/actions/admin-retailers";
import { RetailerFilters } from "@/components/domain/admin/retailer-filters";
import { RetailerListRow } from "@/components/domain/admin/retailer-list-row";
import { RetailerPagination } from "@/components/domain/admin/retailer-pagination";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

async function RetailerList({
  status,
  query,
  page,
}: {
  status?: string;
  query?: string;
  page: number;
}) {
  const result = await listRetailersForAdmin({
    verification_status: status as
      | "unverified"
      | "pending"
      | "verified"
      | "rejected"
      | undefined,
    query,
    page,
  });

  if (!result.success) {
    return (
      <p className="text-destructive text-sm">
        Erro ao carregar lojistas: {result.error}
      </p>
    );
  }

  const { retailers, total, pageSize } = result.data;

  if (retailers.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        Nenhum lojista encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {retailers.map((retailer) => (
          <RetailerListRow key={retailer.id} retailer={retailer} />
        ))}
      </div>
      <RetailerPagination total={total} page={page} pageSize={pageSize} />
    </div>
  );
}

function RetailerListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default async function AdminLojistasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status;
  const query = params.q;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <div className="space-y-6">
      <Masthead eyebrow="Admin" title="Lojistas" />

      <Suspense fallback={null}>
        <RetailerFilters />
      </Suspense>

      <Suspense fallback={<RetailerListSkeleton />}>
        <RetailerList status={status} query={query} page={page} />
      </Suspense>
    </div>
  );
}
