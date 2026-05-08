"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  toggleFavoriteFactory,
  toggleFavoriteProduct,
} from "@/lib/actions/favorites";

interface FavoriteButtonProps {
  targetId: string;
  type: "factory" | "product";
  isFavorited: boolean;
  className?: string;
}

export function FavoriteButton({
  targetId,
  type,
  isFavorited,
  className,
}: FavoriteButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic(isFavorited);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      setOptimistic((prev) => !prev);
      const action =
        type === "factory" ? toggleFavoriteFactory : toggleFavoriteProduct;
      await action(targetId);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={pending}
      aria-label={
        optimistic ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
      className={cn("size-8", className)}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          optimistic
            ? "fill-destructive text-destructive"
            : "text-muted-foreground",
        )}
      />
    </Button>
  );
}
