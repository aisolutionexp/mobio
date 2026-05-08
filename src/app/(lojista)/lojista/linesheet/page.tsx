import Link from "next/link";
import { Plus, FileText } from "lucide-react";

import { listRetailerLinesheets } from "@/lib/actions/linesheets";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateLinesheetDrawer } from "@/components/domain/linesheets/create-linesheet-drawer";

const VARIANT_LABELS: Record<string, string> = {
  retailer: "Atacado",
  msrp: "Sugerido",
  custom: "Customizado",
};

export default async function LinesheetListPage() {
  const linesheets = await listRetailerLinesheets();

  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Catálogo"
        title="Linesheets"
        description="Monte linesheets com seus produtos selecionados e defina preços"
        actions={
          <CreateLinesheetDrawer>
            <Button variant="accent" size="sm">
              <Plus
                aria-hidden="true"
                data-icon="inline-start"
                className="size-3.5"
              />
              Novo linesheet
            </Button>
          </CreateLinesheetDrawer>
        }
      />

      {linesheets.length === 0 ? (
        <Plate className="py-16 text-center">
          <FileText className="text-muted-foreground mx-auto mb-4 size-10" />
          <h2 className="font-heading mb-2 text-lg font-semibold">
            Nenhum linesheet ainda
          </h2>
          <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
            Crie linesheets para montar seleções de produtos com preços
            personalizados e compartilhar com sua equipe.
          </p>
          <CreateLinesheetDrawer>
            <Button variant="accent" size="sm">
              <Plus
                aria-hidden="true"
                data-icon="inline-start"
                className="size-3.5"
              />
              Criar primeiro linesheet
            </Button>
          </CreateLinesheetDrawer>
        </Plate>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {linesheets.map((ls) => (
            <Link
              key={ls.id}
              href={`/lojista/linesheet/${ls.id}`}
              className="group"
            >
              <Plate className="group-hover:border-accent/50 transition-colors">
                <div className="mb-1 flex items-center gap-2">
                  <Eyebrow as="span">
                    {ls.itemCount} {ls.itemCount === 1 ? "produto" : "produtos"}
                  </Eyebrow>
                  <Badge variant="outline" size="sm">
                    {VARIANT_LABELS[ls.pricing_variant] ?? ls.pricing_variant}
                  </Badge>
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  {ls.name}
                </h3>
                {ls.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {ls.description}
                  </p>
                )}
              </Plate>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
