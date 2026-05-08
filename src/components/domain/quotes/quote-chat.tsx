"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { ActionResult } from "@/types/actions";

interface QuoteMessage {
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
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface QuoteChatProps {
  quoteId: string;
  currentUserId: string;
  initialMessages: QuoteMessage[];
  onSendMessage: (quoteId: string, body: string) => Promise<ActionResult>;
  onMarkAsRead?: (quoteId: string) => Promise<ActionResult>;
}

export function QuoteChat({
  quoteId,
  currentUserId,
  initialMessages,
  onSendMessage,
  onMarkAsRead,
}: QuoteChatProps) {
  const [messages, setMessages] = useState<QuoteMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
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
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    onMarkAsRead?.(quoteId);
  }, [quoteId, onMarkAsRead]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`quote-chat:${quoteId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quote_messages",
          filter: `quote_id=eq.${quoteId}`,
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

          const msg: QuoteMessage = {
            ...raw,
            profiles: profile ?? null,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();

          if (raw.sender_user_id !== currentUserId) {
            onMarkAsRead?.(quoteId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quoteId, currentUserId, scrollToBottom, onMarkAsRead]);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    const result = await onSendMessage(quoteId, trimmed);
    if (result.success) {
      setBody("");
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col">
      <div ref={scrollRef} className="max-h-96 space-y-3 overflow-y-auto p-1">
        {messages.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Nenhuma mensagem ainda. Inicie a conversa!
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_user_id === currentUserId;
            const initials =
              msg.profiles?.full_name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase() ?? "?";

            return (
              <div
                key={msg.id}
                className={cn("flex gap-3", isMine && "flex-row-reverse")}
              >
                <Avatar
                  src={msg.profiles?.avatar_path ?? undefined}
                  alt={msg.profiles?.full_name ?? "Usuário"}
                  fallback={initials}
                  size="sm"
                />
                <div
                  className={cn(
                    "max-w-[75%] space-y-1",
                    isMine && "items-end text-right",
                  )}
                >
                  <p className="text-muted-foreground text-xs">
                    {msg.profiles?.full_name ?? "Usuário"}
                  </p>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <p className="break-words whitespace-pre-wrap">
                      {msg.body}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-border mt-4 flex items-end gap-2 border-t pt-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="max-h-32 min-h-[40px] resize-none"
          rows={1}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!body.trim() || sending}
        >
          <Send className="size-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
    </div>
  );
}
