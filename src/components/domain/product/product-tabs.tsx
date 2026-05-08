"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SpecRow } from "./spec-row";
import { FinishSwatch } from "./finish-swatch";

interface ProductTabsProps {
  specs: { id: string; spec_key: string; spec_value: string }[];
  finishes: { id: string; name: string; description: string | null }[];
  factoryName: string | null;
  shippingPolicy: unknown;
}

export function ProductTabs({
  specs,
  finishes,
  factoryName,
  shippingPolicy,
}: ProductTabsProps) {
  const shipping = shippingPolicy as {
    delivery_days_min?: number;
    delivery_days_max?: number;
  } | null;

  return (
    <Tabs defaultValue="specs">
      <TabsList>
        <TabsTrigger value="specs">Especificações</TabsTrigger>
        <TabsTrigger value="finishes">Acabamentos</TabsTrigger>
        <TabsTrigger value="details">Detalhes</TabsTrigger>
      </TabsList>

      <TabsContent value="specs" className="mt-4">
        {specs.length > 0 ? (
          <div className="divide-border divide-y">
            {specs.map((spec) => (
              <SpecRow
                key={spec.id}
                label={spec.spec_key}
                value={spec.spec_value}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-4 text-sm">
            Nenhuma especificação cadastrada.
          </p>
        )}
      </TabsContent>

      <TabsContent value="finishes" className="mt-4">
        {finishes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {finishes.map((finish) => (
              <FinishSwatch key={finish.id} finish={finish} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-4 text-sm">
            Nenhum acabamento cadastrado.
          </p>
        )}
      </TabsContent>

      <TabsContent value="details" className="mt-4 space-y-3">
        {factoryName && (
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Fabricante
            </p>
            <p className="text-sm">{factoryName}</p>
          </div>
        )}
        {shipping &&
          (shipping.delivery_days_min || shipping.delivery_days_max) && (
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Prazo de entrega
              </p>
              <p className="text-sm">
                {shipping.delivery_days_min && shipping.delivery_days_max
                  ? `${shipping.delivery_days_min} a ${shipping.delivery_days_max} dias úteis`
                  : `${shipping.delivery_days_min ?? shipping.delivery_days_max} dias úteis`}
              </p>
            </div>
          )}
        {!factoryName && !shipping && (
          <p className="text-muted-foreground py-4 text-sm">
            Nenhum detalhe adicional disponível.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
