"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { ConversationPreview } from "@/lib/actions/conversations";

function formatRelativeTime(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function contextLabel(type: string | null) {
  if (!type || type === "general") return null;
  const labels: Record<string, string> = {
    quote: "Orçamento",
    order: "Pedido",
    showroom_booking: "Showroom",
  };
  return labels[type] ?? type;
}

interface ConversationListProps {
  conversations: ConversationPreview[];
  currentUserId: string;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  currentUserId,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const [filter, setFilter] = useState("");

  const convIdsKey = useMemo(
    () => conversations.map((c) => c.id).join(","),
    [conversations],
  );

  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const ids = convIdsKey.split(",").filter(Boolean);
    if (ids.length === 0) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`conversation-list-messages-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as {
            id: string;
            conversation_id: string;
            body: string;
            sender_user_id: string;
            created_at: string;
          };

          setConversations((prev) => {
            if (!prev.some((c) => c.id === msg.conversation_id)) return prev;
            return prev
              .map((c) => {
                if (c.id !== msg.conversation_id) return c;
                return {
                  ...c,
                  last_message_body: msg.body,
                  last_message_at: msg.created_at,
                  unread_count:
                    msg.sender_user_id !== currentUserId &&
                    c.id !== selectedIdRef.current
                      ? c.unread_count + 1
                      : c.unread_count,
                };
              })
              .sort((a, b) => {
                const aTime = a.last_message_at
                  ? new Date(a.last_message_at).getTime()
                  : 0;
                const bTime = b.last_message_at
                  ? new Date(b.last_message_at).getTime()
                  : 0;
                return bTime - aTime;
              });
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [convIdsKey, currentUserId]);

  const clearUnread = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c,
      ),
    );
  }, []);

  const filtered = filter
    ? conversations.filter((c) =>
        c.counterpart_name.toLowerCase().includes(filter.toLowerCase()),
      )
    : conversations;

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="border-border space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Mensagens</h2>
          {totalUnread > 0 && (
            <Badge variant="default" size="sm">
              {totalUnread}
            </Badge>
          )}
        </div>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar conversas..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground p-4 text-center text-sm">
            {filter ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
          </p>
        ) : (
          filtered.map((conv) => {
            const initials =
              conv.counterpart_name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase() || "?";
            const ctx = contextLabel(conv.context_type);

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  onSelect(conv.id);
                  clearUnread(conv.id);
                }}
                className={cn(
                  "border-border flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors",
                  "hover:bg-muted/50",
                  selectedId === conv.id && "bg-muted",
                )}
              >
                <Avatar
                  src={conv.counterpart_logo ?? undefined}
                  alt={conv.counterpart_name}
                  fallback={initials}
                  size="sm"
                  shape="square"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "truncate text-sm",
                        conv.unread_count > 0 ? "font-semibold" : "font-medium",
                      )}
                    >
                      {conv.counterpart_name}
                    </p>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatRelativeTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "line-clamp-1 text-xs",
                        conv.unread_count > 0
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {conv.last_message_body ?? "Sem mensagens"}
                    </p>
                    {conv.unread_count > 0 && (
                      <Badge variant="default" size="sm">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  {ctx && (
                    <Badge variant="outline" size="sm" className="mt-1">
                      {ctx}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-1 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
