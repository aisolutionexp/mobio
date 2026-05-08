import Link from "next/link";
import { Plus, Layers } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { AppMetadata } from "@/lib/auth/permissions";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateCollectionDrawer } from "@/components/domain/catalog/create-collection-drawer";
import { StatusFilter } from "@/components/domain/catalog/status-filter";

const STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  published: { label: "Publicada", variant: "success" as const },
  archived: { label: "Arquivada", variant: "outline" as const },
} as const;

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tenantId = (user?.app_metadata as AppMetadata | undefined)
    ?.active_tenant_id;

  let query = supabase
    .from("collections")
    .select("*, products(count)")
    .eq("factory_id", tenantId!)
    .order("created_at", { ascending: false });

  if (status === "draft" || status === "published" || status === "archived") {
    query = query.eq("status", status);
  } else {
    query = query.in("status", ["draft", "published"]);
  }

  const { data: collections } = await query;

  const hasCollections = collections && collections.length > 0;

  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Atelier"
        title="Catálogo"
        description="Suas coleções e produtos"
        actions={
          <CreateCollectionDrawer>
            <Button variant="accent" leftIcon={<Plus />}>
              Nova coleção
            </Button>
          </CreateCollectionDrawer>
        }
      />

      <StatusFilter />

      {hasCollections ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const status =
              STATUS_BADGE[collection.status as keyof typeof STATUS_BADGE] ??
              STATUS_BADGE.draft;
            const productCount =
              (collection.products as unknown as { count: number }[])?.[0]
                ?.count ?? 0;

            return (
              <Link
                key={collection.id}
                href={`/atelier/catalogo/${collection.id}`}
              >
                <Plate className="group hover:border-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading group-hover:text-accent truncate text-lg font-semibold transition-colors">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={status.variant} size="sm">
                      {status.label}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
                    <span>
                      {productCount}{" "}
                      {productCount === 1 ? "produto" : "produtos"}
                    </span>
                    <span>
                      {new Date(collection.created_at).toLocaleDateString(
                        "pt-BR",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </span>
                  </div>
                </Plate>
              </Link>
            );
          })}
        </div>
      ) : (
        <Plate className="flex flex-col items-center py-16 text-center">
          <Layers className="text-muted-foreground mb-4 size-12" />
          <h3 className="font-heading text-xl font-semibold">
            Nenhuma coleção ainda
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Crie sua primeira coleção para começar a organizar seus produtos.
          </p>
          <CreateCollectionDrawer>
            <Button variant="accent" className="mt-6" leftIcon={<Plus />}>
              Criar primeira coleção
            </Button>
          </CreateCollectionDrawer>
        </Plate>
      )}
    </div>
  );
}
