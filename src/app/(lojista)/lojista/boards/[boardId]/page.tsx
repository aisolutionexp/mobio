import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getBoardWithItems } from "@/lib/actions/boards";
import { Masthead } from "@/components/editorial/masthead";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { BoardGrid } from "@/components/domain/boards/board-grid";
import { BoardActionsMenu } from "@/components/domain/boards/board-actions-menu";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const board = await getBoardWithItems(boardId);

  if (!board) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="text-muted-foreground flex items-center gap-1 text-sm">
        <Link
          href="/lojista/boards"
          className="hover:text-foreground transition-colors"
        >
          Boards
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">{board.name}</span>
      </nav>

      <Masthead
        eyebrow={`${board.items.length} ${board.items.length === 1 ? "produto" : "produtos"}`}
        title={board.name}
        description={board.description ?? undefined}
        actions={
          <BoardActionsMenu
            boardId={board.id}
            boardName={board.name}
            isPublic={board.isPublic ?? false}
          />
        }
      />

      {board.isPublic && (
        <Eyebrow as="span" className="text-accent">
          Público
        </Eyebrow>
      )}

      <BoardGrid boardId={board.id} initialItems={board.items} />
    </div>
  );
}
