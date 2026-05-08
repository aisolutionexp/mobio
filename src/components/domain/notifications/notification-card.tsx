"use client";

import { useState } from "react";
import {
  Bell,
  Package,
  ShieldCheck,
  MessageSquare,
  CreditCard,
  CheckCheck,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { markAsRead, deleteNotification } from "@/lib/actions/notifications";

const TYPE_ICONS: Record<string, React.ElementType> = {
  order_status_changed: Package,
  verify_retailer: ShieldCheck,
  new_quote: MessageSquare,
  quote_message: MessageSquare,
  payment_received: CreditCard,
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

interface NotificationCardProps {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  onRemoved?: (id: string) => void;
}

export function NotificationCard({
  id,
  type,
  title,
  body,
  link,
  isRead,
  createdAt,
  onRemoved,
}: NotificationCardProps) {
  const [read, setRead] = useState(isRead);
  const [pending, setPending] = useState(false);

  const Icon = TYPE_ICONS[type] ?? Bell;

  async function handleMarkRead() {
    setPending(true);
    const result = await markAsRead(id);
    if (result.success) setRead(true);
    setPending(false);
  }

  async function handleDelete() {
    setPending(true);
    const result = await deleteNotification(id);
    if (result.success) onRemoved?.(id);
    setPending(false);
  }

  return (
    <div
      className={cn(
        "border-border flex items-start gap-4 rounded-lg border p-4 transition-colors",
        !read && "bg-accent/30 border-accent",
      )}
    >
      <div
        className={cn(
          "bg-muted flex size-10 shrink-0 items-center justify-center rounded-full",
          !read && "bg-accent text-accent-foreground",
        )}
      >
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", !read && "font-semibold")}>{title}</p>
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatRelative(createdAt)}
          </span>
        </div>
        {body && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{body}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          {link && (
            <a
              href={link}
              className="text-primary text-xs font-medium hover:underline"
            >
              Ver
            </a>
          )}
          {!read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs"
              onClick={handleMarkRead}
              disabled={pending}
            >
              <CheckCheck className="size-3.5" />
              Marcar como lida
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-6 gap-1 px-2 text-xs"
            onClick={handleDelete}
            disabled={pending}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {!read && (
        <div className="bg-accent mt-1 size-2.5 shrink-0 rounded-full" />
      )}
    </div>
  );
}
