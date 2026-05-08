"use client";

import { useCallback } from "react";
import { QuoteChat } from "@/components/domain/quotes/quote-chat";
import {
  sendQuoteMessage,
  markQuoteMessagesAsRead,
} from "@/lib/actions/quotes";

interface FactoryQuoteChatWrapperProps {
  quoteId: string;
  currentUserId: string;
  initialMessages: Array<{
    id: string;
    body: string;
    is_read: boolean;
    created_at: string;
    sender_user_id: string;
    profiles: {
      id: string;
      full_name: string;
      avatar_path: string | null;
    } | null;
  }>;
}

export function FactoryQuoteChatWrapper({
  quoteId,
  currentUserId,
  initialMessages,
}: FactoryQuoteChatWrapperProps) {
  const handleSend = useCallback(
    (qId: string, body: string) => sendQuoteMessage(qId, body),
    [],
  );

  const handleMarkRead = useCallback(
    (qId: string) => markQuoteMessagesAsRead(qId),
    [],
  );

  return (
    <QuoteChat
      quoteId={quoteId}
      currentUserId={currentUserId}
      initialMessages={initialMessages}
      onSendMessage={handleSend}
      onMarkAsRead={handleMarkRead}
    />
  );
}
