"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAttachmentUrl } from "@/lib/actions/message-attachments";

interface MessageAttachmentCardProps {
  attachment: {
    id: string;
    file_name: string;
    file_type: string;
    file_size_bytes: number;
    storage_path: string;
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageAttachmentCard({
  attachment,
}: MessageAttachmentCardProps) {
  const [loading, setLoading] = useState(false);
  const isImage = attachment.file_type.startsWith("image/");

  async function handleDownload() {
    setLoading(true);
    try {
      const result = await getAttachmentUrl(attachment.storage_path);
      if (result.success) {
        window.open(result.data.url, "_blank");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={cn(
        "border-border bg-background flex w-full max-w-xs items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
        "hover:bg-muted disabled:opacity-50",
      )}
    >
      {isImage ? (
        <ImageIcon className="text-muted-foreground size-4 shrink-0" />
      ) : (
        <FileText className="text-muted-foreground size-4 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{attachment.file_name}</p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize(attachment.file_size_bytes)}
        </p>
      </div>
      <Download className="text-muted-foreground size-3.5 shrink-0" />
    </button>
  );
}
