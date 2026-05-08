"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOrCreateConversation } from "@/lib/actions/conversations";
import { toast } from "sonner";

interface OpenConversationLinkProps {
  factoryId: string;
  retailerId: string;
  contextType: "quote" | "order" | "showroom_booking";
  contextId: string;
  shellPrefix: "atelier" | "lojista";
}

export function OpenConversationLink({
  factoryId,
  retailerId,
  contextType,
  contextId,
  shellPrefix,
}: OpenConversationLinkProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await getOrCreateConversation({
        factory_id: factoryId,
        retailer_id: retailerId,
        context_type: contextType,
        context_id: contextId,
      });

      if (result.success) {
        router.push(`/${shellPrefix}/mensagens?conversation=${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <MessageSquare className="mr-1.5 size-4" />
      {isPending ? "Abrindo..." : "Abrir conversa"}
    </Button>
  );
}
