"use client";

import { useCallback, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadMessageAttachment } from "@/lib/actions/message-attachments";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "@/lib/validators/message-attachments";
import { toast } from "sonner";

interface PendingAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_path: string;
}

interface AttachmentPickerProps {
  conversationId: string;
  attachments: PendingAttachment[];
  onAttachmentAdded: (att: PendingAttachment) => void;
  onAttachmentRemoved: (id: string) => void;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentPicker({
  conversationId,
  attachments,
  onAttachmentAdded,
  onAttachmentRemoved,
}: AttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: arquivo deve ter no máximo 25MB`);
          continue;
        }
        if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
          toast.error(`${file.name}: tipo de arquivo não permitido`);
          continue;
        }

        setUploading(true);
        const formData = new FormData();
        formData.set("file", file);
        formData.set("conversation_id", conversationId);

        const result = await uploadMessageAttachment(formData);
        if (result.success) {
          onAttachmentAdded({
            id: result.data.id,
            file_name: file.name,
            file_type: file.type,
            file_size_bytes: file.size,
            storage_path: result.data.storage_path,
          });
        } else {
          toast.error(result.error);
        }
        setUploading(false);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [conversationId, onAttachmentAdded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_FILE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title="Anexar arquivo"
      >
        <Paperclip className="size-4" />
        <span className="sr-only">Anexar</span>
      </Button>

      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <span
              key={att.id}
              className="border-border bg-muted flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
            >
              <span className="max-w-32 truncate">{att.file_name}</span>
              <span className="text-muted-foreground">
                ({formatFileSize(att.file_size_bytes)})
              </span>
              <button
                type="button"
                onClick={() => onAttachmentRemoved(att.id)}
                className="text-muted-foreground hover:text-destructive ml-0.5"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
}
