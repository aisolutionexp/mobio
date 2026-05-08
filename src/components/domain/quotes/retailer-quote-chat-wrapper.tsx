"use client";

import { useCallback } from "react";
import { QuoteChat } from "@/components/domain/quotes/quote-chat";
import {
  sendRetailerQuoteMessage,
  markRetailerQuoteMessagesAsRead,
} from "@/lib/actions/quotes-retailer";

interface RetailerQuoteChatWrapperProps {
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

export function RetailerQuoteChatWrapper({
  quoteId,
  currentUserId,
  initialMessages,
}: RetailerQuoteChatWrapperProps) {
  const handleSend = useCallback(
    (qId: string, body: string) => sendRetailerQuoteMessage(qId, body),
    [],
  );

  const handleMarkRead = useCallback(
    (qId: string) => markRetailerQuoteMessagesAsRead(qId),
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
