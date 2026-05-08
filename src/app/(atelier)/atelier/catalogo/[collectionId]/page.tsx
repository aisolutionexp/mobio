import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Package, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { AppMetadata } from "@/lib/auth/permissions";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Rule } from "@/components/editorial/rule";
import { CollectionTabs } from "@/components/domain/catalog/collection-tabs";
import { CreateProductDrawer } from "@/components/domain/catalog/create-product-drawer";
import { CollectionStatusActions } from "@/components/domain/catalog/collection-status-actions";

const STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  published: { label: "Publicado", variant: "success" as const },
  archived: { label: "Arquivado", variant: "outline" as const },
} as const;

const COLLECTION_STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  published: { label: "Publicada", variant: "success" as const },
  archived: { label: "Arquivada", variant: "outline" as const },
} as const;

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tenantId = (user?.app_metadata as AppMetadata | undefined)
    ?.active_tenant_id;

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, description, status, slug, created_at")
    .eq("id", collectionId)
    .eq("factory_id", tenantId!)
    .single();

  if (!collection) notFound();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, reference, description, status, wholesale_price, created_at",
    )
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false });

  const hasProducts = products && products.length > 0;
  const collectionStatus =
    COLLECTION_STATUS_BADGE[
      collection.status as keyof typeof COLLECTION_STATUS_BADGE
    ] ?? COLLECTION_STATUS_BADGE.draft;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          href="/atelier/catalogo"
          className="hover:text-foreground transition-colors"
        >
          Catálogo
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground truncate font-medium">
          {collection.name}
        </span>
      </nav>

      <Masthead
        title={collection.name}
        description={collection.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={collectionStatus.variant}>
              {collectionStatus.label}
            </Badge>
            <CreateProductDrawer collectionId={collectionId}>
              <Button variant="accent" leftIcon={<Plus />}>
                Novo produto
              </Button>
            </CreateProductDrawer>
            <CollectionStatusActions
              collectionId={collectionId}
              currentStatus={collection.status}
            />
          </div>
        }
      />

      <CollectionTabs
        productsTab={
          hasProducts ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const pStatus =
                  STATUS_BADGE[
                    (product.status as keyof typeof STATUS_BADGE) ?? "draft"
                  ] ?? STATUS_BADGE.draft;

                return (
                  <Link
                    key={product.id}
                    href={`/atelier/catalogo/${collectionId}/${product.id}`}
                  >
                    <Plate className="group hover:border-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-heading group-hover:text-accent truncate text-base font-semibold transition-colors">
                            {product.name}
                          </h3>
                          {product.reference && (
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              REF: {product.reference}
                            </p>
                          )}
                        </div>
                        <Badge variant={pStatus.variant} size="sm">
                          {pStatus.label}
                        </Badge>
                      </div>

                      {product.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                          {product.description}
                        </p>
                      )}

                      {product.wholesale_price != null && (
                        <p className="mt-3 text-sm font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.wholesale_price)}
                        </p>
                      )}
                    </Plate>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Plate className="mt-6 flex flex-col items-center py-16 text-center">
              <Package className="text-muted-foreground mb-4 size-12" />
              <h3 className="font-heading text-xl font-semibold">
                Nenhum produto ainda
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                Adicione o primeiro produto a esta coleção.
              </p>
              <CreateProductDrawer collectionId={collectionId}>
                <Button variant="accent" className="mt-6" leftIcon={<Plus />}>
                  Adicionar primeiro produto
                </Button>
              </CreateProductDrawer>
            </Plate>
          )
        }
        detailsTab={
          <div className="mt-6 space-y-6">
            <Plate>
              <div className="space-y-4">
                <div>
                  <Eyebrow as="p" className="mb-1">
                    Nome
                  </Eyebrow>
                  <p className="text-base">{collection.name}</p>
                </div>
                <Rule spacing="sm" />
                <div>
                  <Eyebrow as="p" className="mb-1">
                    Descrição
                  </Eyebrow>
                  <p className="text-muted-foreground text-sm">
                    {collection.description || "Sem descrição"}
                  </p>
                </div>
                <Rule spacing="sm" />
                <div>
                  <Eyebrow as="p" className="mb-1">
                    Status
                  </Eyebrow>
                  <Badge variant={collectionStatus.variant}>
                    {collectionStatus.label}
                  </Badge>
                </div>
                <Rule spacing="sm" />
                <div>
                  <Eyebrow as="p" className="mb-1">
                    Criada em
                  </Eyebrow>
                  <p className="text-sm">
                    {new Date(collection.created_at).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </Plate>
          </div>
        }
        activityTab={
          <div className="mt-6 space-y-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 py-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
                {i < 2 && <Rule spacing="sm" variant="dotted" />}
              </div>
            ))}
          </div>
        }
      />
    </div>
  );
}
