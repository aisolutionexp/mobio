"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ConversationList } from "./conversation-list";
import { ConversationView, ConversationViewEmpty } from "./conversation-view";
import type { ConversationPreview } from "@/lib/actions/conversations";

interface MessagingLayoutProps {
  conversations: ConversationPreview[];
  currentUserId: string;
  shellPrefix: "atelier" | "lojista";
}

export function MessagingLayout({
  conversations,
  currentUserId,
  shellPrefix,
}: MessagingLayoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const conversationParam = searchParams.get("conversation");
  const [selectedId, setSelectedId] = useState<string | null>(
    conversationParam,
  );

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  function handleSelect(id: string) {
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("conversation", id);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  return (
    <div className="border-border grid h-[calc(100vh-10rem)] grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-[360px_1fr]">
      {/* Left: Conversation List */}
      <div className="border-border overflow-hidden border-r md:block">
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          selectedId={selectedId ?? undefined}
          onSelect={handleSelect}
        />
      </div>

      {/* Right: Conversation View */}
      <div className="overflow-hidden">
        {selectedConversation ? (
          <ConversationView
            conversationId={selectedConversation.id}
            currentUserId={currentUserId}
            counterpartName={selectedConversation.counterpart_name}
            counterpartLogo={selectedConversation.counterpart_logo}
            contextType={selectedConversation.context_type}
          />
        ) : (
          <ConversationViewEmpty />
        )}
      </div>
    </div>
  );
}
