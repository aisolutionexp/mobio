"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { markAllAsRead } from "@/lib/actions/notifications";
import { NotificationCard } from "@/components/domain/notifications/notification-card";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationListProps {
  initialNotifications: Notification[];
  userId: string;
  showUnreadOnly?: boolean;
}

export function NotificationList({
  initialNotifications,
  userId,
  showUnreadOnly = false,
}: NotificationListProps) {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">(
    showUnreadOnly ? "unread" : "all",
  );
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const filtered =
    filter === "unread" ? items.filter((n) => !n.is_read) : items;

  const handleRemoved = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  async function handleMarkAll() {
    setMarkingAll(true);
    const result = await markAllAsRead();
    if (result.success) {
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
    setMarkingAll(false);
  }

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setItems((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Não lidas{unreadCount > 0 && ` (${unreadCount})`}
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="gap-1"
          >
            <CheckCheck className="size-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Inbox className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            {filter === "unread"
              ? "Nenhuma notificação não lida"
              : "Nenhuma notificação"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <NotificationCard
              key={n.id}
              id={n.id}
              type={n.type}
              title={n.title}
              body={n.body}
              link={n.link}
              isRead={n.is_read}
              createdAt={n.created_at}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
