import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { MessageAttachmentCard } from "./message-attachment-card";

interface MessageBubbleProps {
  body: string;
  senderName: string;
  senderAvatar: string | null;
  timestamp: string;
  isMine: boolean;
  attachments?: Array<{
    id: string;
    file_name: string;
    file_type: string;
    file_size_bytes: number;
    storage_path: string;
  }>;
  highlighted?: boolean;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessageBubble({
  body,
  senderName,
  senderAvatar,
  timestamp,
  isMine,
  attachments,
  highlighted,
}: MessageBubbleProps) {
  const initials =
    senderName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className={cn("flex gap-3", isMine && "flex-row-reverse")}>
      <Avatar
        src={senderAvatar ?? undefined}
        alt={senderName}
        fallback={initials}
        size="sm"
      />
      <div
        className={cn(
          "max-w-[75%] space-y-1",
          isMine && "items-end text-right",
        )}
      >
        <p className="text-muted-foreground text-xs">{senderName}</p>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isMine ? "bg-primary text-primary-foreground" : "bg-muted",
            highlighted && "ring-warning ring-2",
          )}
        >
          <p className="break-words whitespace-pre-wrap">{body}</p>
        </div>
        {attachments && attachments.length > 0 && (
          <div className="mt-1 space-y-1">
            {attachments.map((att) => (
              <MessageAttachmentCard key={att.id} attachment={att} />
            ))}
          </div>
        )}
        <p className="text-muted-foreground text-xs">{formatTime(timestamp)}</p>
      </div>
    </div>
  );
}
