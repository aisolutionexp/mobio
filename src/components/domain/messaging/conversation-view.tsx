"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Send, Search, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessage,
  markMessagesAsRead,
  listConversationMessages,
  type ConversationMessage,
} from "@/lib/actions/conversations";
import { deleteMessageAttachment } from "@/lib/actions/message-attachments";
import { MessageBubble } from "./message-bubble";
import { AttachmentPicker } from "./attachment-picker";
import { ConversationSearch } from "./conversation-search";
import { toast } from "sonner";

function contextLabel(type: string | null) {
  if (!type || type === "general") return null;
  const labels: Record<string, string> = {
    quote: "Orçamento",
    order: "Pedido",
    showroom_booking: "Showroom",
  };
  return labels[type] ?? type;
}

interface PendingAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_path: string;
}

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  counterpartName: string;
  counterpartLogo: string | null;
  contextType?: string | null;
}

export function ConversationView({
  conversationId,
  currentUserId,
  counterpartName,
  counterpartLogo,
  contextType,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    listConversationMessages(conversationId).then((msgs) => {
      if (!cancelled) {
        setMessages(msgs);
        setLoading(false);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
          });
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    markMessagesAsRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`conv-messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const raw = payload.new as {
            id: string;
            body: string;
            is_read: boolean;
            created_at: string;
            sender_user_id: string;
          };

          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_path")
            .eq("id", raw.sender_user_id)
            .single();

          const msg: ConversationMessage = {
            ...raw,
            attachments: [],
            profiles: profile ?? null,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();

          if (raw.sender_user_id !== currentUserId) {
            markMessagesAsRead(conversationId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, scrollToBottom]);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    const result = await sendMessage({
      conversation_id: conversationId,
      body: trimmed,
      attachment_ids: attachments.map((a) => a.id),
    });

    if (result.success) {
      setBody("");
      setAttachments([]);
    } else {
      toast.error(result.error);
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const handleAttachmentAdded = useCallback((att: PendingAttachment) => {
    setAttachments((prev) => [...prev, att]);
  }, []);

  const handleAttachmentRemoved = useCallback(async (id: string) => {
    await deleteMessageAttachment(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  function handleSearchResultClick(messageId: string) {
    setHighlightedId(messageId);
    const el = document.getElementById(`msg-${messageId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightedId(null), 3000);
  }

  const initials =
    counterpartName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";

  const ctx = contextLabel(contextType ?? null);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={counterpartLogo ?? undefined}
            alt={counterpartName}
            fallback={initials}
            size="sm"
            shape="square"
          />
          <div>
            <p className="text-sm font-semibold">{counterpartName}</p>
            {ctx && (
              <Badge variant="outline" size="sm">
                {ctx}
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch((v) => !v)}
          aria-label="Buscar mensagens"
        >
          <Search className="size-4" />
        </Button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="border-border border-b p-3">
          <ConversationSearch
            conversationId={conversationId}
            onResultClick={handleSearchResultClick}
          />
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <ConversationViewSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="text-muted-foreground mb-2 size-8" />
            <p className="text-muted-foreground text-sm">
              Nenhuma mensagem ainda. Inicie a conversa!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} id={`msg-${msg.id}`}>
              <MessageBubble
                body={msg.body}
                senderName={msg.profiles?.full_name ?? "Usuário"}
                senderAvatar={msg.profiles?.avatar_path ?? null}
                timestamp={msg.created_at}
                isMine={msg.sender_user_id === currentUserId}
                attachments={msg.attachments}
                highlighted={highlightedId === msg.id}
              />
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="border-border space-y-2 border-t p-4">
        <div className="flex items-end gap-2">
          <AttachmentPicker
            conversationId={conversationId}
            attachments={attachments}
            onAttachmentAdded={handleAttachmentAdded}
            onAttachmentRemoved={handleAttachmentRemoved}
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="max-h-32 min-h-[40px] flex-1 resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={(!body.trim() && attachments.length === 0) || sending}
          >
            <Send className="size-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConversationViewSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn("flex gap-3", i % 2 === 0 ? "" : "flex-row-reverse")}
        >
          <Skeleton className="size-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationViewEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <MessageSquare className="text-muted-foreground mb-3 size-12" />
      <p className="text-muted-foreground text-center text-sm">
        Selecione uma conversa para ver as mensagens
      </p>
    </div>
  );
}
