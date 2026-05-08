"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LinesheetGrid } from "@/components/domain/linesheets/linesheet-grid";
import { ImportBoardDialog } from "@/components/domain/linesheets/import-board-dialog";
import { AddProductToLinesheetDialog } from "@/components/domain/linesheets/add-product-to-linesheet-dialog";
import { LinesheetSettingsForm } from "@/components/domain/linesheets/linesheet-settings-form";
import { ShareTokenList } from "@/components/domain/linesheets/share-token-list";
import { CreateShareTokenForm } from "@/components/domain/linesheets/create-share-token-form";
import type { ShareTokenData } from "@/lib/actions/linesheet-share";
import type { LinesheetItemData } from "@/components/domain/linesheets/linesheet-item-card";

interface LinesheetData {
  id: string;
  name: string;
  description: string | null;
  pricingVariant: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: LinesheetItemData[];
}

interface BoardOption {
  id: string;
  name: string;
  itemCount: number;
}

interface ProductOption {
  id: string;
  name: string;
  reference: string | null;
  factoryName: string | null;
}

export function LinesheetBuilderTabs({
  linesheet,
  boards,
  availableProducts,
  existingProductIds,
  shareTokens,
}: {
  linesheet: LinesheetData;
  boards: BoardOption[];
  availableProducts: ProductOption[];
  existingProductIds: Set<string>;
  shareTokens: ShareTokenData[];
}) {
  return (
    <Tabs defaultValue="items">
      <TabsList>
        <TabsTrigger value="items">Items</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
        <TabsTrigger value="share">Compartilhar</TabsTrigger>
      </TabsList>

      <TabsContent value="items">
        <div className="mb-4 flex flex-wrap gap-2">
          <ImportBoardDialog linesheetId={linesheet.id} boards={boards} />
          <AddProductToLinesheetDialog
            linesheetId={linesheet.id}
            products={availableProducts}
            existingProductIds={existingProductIds}
          />
        </div>
        <LinesheetGrid
          linesheetId={linesheet.id}
          initialItems={linesheet.items}
          pricingVariant={linesheet.pricingVariant}
        />
      </TabsContent>

      <TabsContent value="settings">
        <LinesheetSettingsForm
          linesheetId={linesheet.id}
          initialName={linesheet.name}
          initialDescription={linesheet.description}
          initialPricingVariant={linesheet.pricingVariant}
          itemCount={linesheet.items.length}
          updatedAt={linesheet.updatedAt}
        />
      </TabsContent>

      <TabsContent value="share">
        <div className="space-y-6">
          <CreateShareTokenForm linesheetId={linesheet.id} />
          <div>
            <h3 className="mb-3 text-sm font-medium">Links ativos</h3>
            <ShareTokenList tokens={shareTokens} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
