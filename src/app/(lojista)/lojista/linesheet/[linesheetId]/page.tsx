import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  getLinesheetWithItems,
  listAvailableProducts,
} from "@/lib/actions/linesheets";
import { listRetailerBoards } from "@/lib/actions/boards";
import { listShareTokens } from "@/lib/actions/linesheet-share";
import { Masthead } from "@/components/editorial/masthead";
import { ExportPdfButton } from "@/components/domain/linesheets/export-pdf-button";
import { LinesheetActionsMenu } from "@/components/domain/linesheets/linesheet-actions-menu";
import { LinesheetBuilderTabs } from "@/components/domain/linesheets/linesheet-builder-tabs";

export default async function LinesheetBuilderPage({
  params,
}: {
  params: Promise<{ linesheetId: string }>;
}) {
  const { linesheetId } = await params;
  const linesheet = await getLinesheetWithItems(linesheetId);

  if (!linesheet) {
    notFound();
  }

  const [boards, availableProducts, shareTokens] = await Promise.all([
    listRetailerBoards(),
    listAvailableProducts(linesheetId),
    listShareTokens(linesheetId),
  ]);

  const boardOptions = boards.map((b) => ({
    id: b.id,
    name: b.name,
    itemCount: b.itemCount,
  }));

  const existingProductIds = new Set<string>(
    linesheet.items
      .map((i) => i.product?.id)
      .filter((id): id is string => id != null),
  );

  return (
    <div className="space-y-6">
      <nav className="text-muted-foreground flex items-center gap-1 text-sm">
        <Link
          href="/lojista/linesheet"
          className="hover:text-foreground transition-colors"
        >
          Linesheets
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">{linesheet.name}</span>
      </nav>

      <Masthead
        eyebrow={`${linesheet.items.length} ${linesheet.items.length === 1 ? "produto" : "produtos"}`}
        title={linesheet.name}
        description={linesheet.description ?? undefined}
        actions={
          <>
            <ExportPdfButton linesheetId={linesheet.id} />
            <LinesheetActionsMenu
              linesheetId={linesheet.id}
              linesheetName={linesheet.name}
            />
          </>
        }
      />

      <LinesheetBuilderTabs
        linesheet={linesheet}
        boards={boardOptions}
        availableProducts={availableProducts}
        existingProductIds={existingProductIds}
        shareTokens={shareTokens}
      />
    </div>
  );
}
