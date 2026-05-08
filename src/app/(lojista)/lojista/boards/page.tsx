import Link from "next/link";
import { Plus, LayoutGrid } from "lucide-react";

import { listRetailerBoards } from "@/lib/actions/boards";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Button } from "@/components/ui/button";
import { CreateBoardDrawer } from "@/components/domain/boards/create-board-drawer";

export default async function BoardsPage() {
  const boards = await listRetailerBoards();

  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Curadoria"
        title="Boards"
        description="Organize seus produtos favoritos em boards de curadoria"
        actions={
          <CreateBoardDrawer>
            <Button variant="accent" size="sm">
              <Plus
                aria-hidden="true"
                data-icon="inline-start"
                className="size-3.5"
              />
              Novo board
            </Button>
          </CreateBoardDrawer>
        }
      />

      {boards.length === 0 ? (
        <Plate className="py-16 text-center">
          <LayoutGrid className="text-muted-foreground mx-auto mb-4 size-10" />
          <h2 className="font-heading mb-2 text-lg font-semibold">
            Nenhum board ainda
          </h2>
          <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
            Crie boards para organizar produtos de diferentes ateliers e
            compartilhar com sua equipe.
          </p>
          <CreateBoardDrawer>
            <Button variant="accent" size="sm">
              <Plus
                aria-hidden="true"
                data-icon="inline-start"
                className="size-3.5"
              />
              Criar primeiro board
            </Button>
          </CreateBoardDrawer>
        </Plate>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/lojista/boards/${board.id}`}
              className="group"
            >
              <Plate className="group-hover:border-accent/50 transition-colors">
                <Eyebrow as="span" className="mb-1">
                  {board.itemCount}{" "}
                  {board.itemCount === 1 ? "produto" : "produtos"}
                </Eyebrow>
                <h3 className="font-heading text-lg font-semibold">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {board.description}
                  </p>
                )}
                {board.is_public && (
                  <span className="text-accent mt-2 inline-block text-xs font-medium">
                    Público
                  </span>
                )}
              </Plate>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
