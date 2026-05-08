"use client";

import { File, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteRetailerDocument,
  getDocumentSignedUrl,
} from "@/lib/actions/retailer-documents";
import { getDocTypeLabel } from "./document-upload-card";
import { toast } from "sonner";

interface DocumentListRowProps {
  document: {
    id: string;
    doc_type: string;
    file_name: string;
    uploaded_at: string;
    verified_at: string | null;
  };
}

export function DocumentListRow({ document }: DocumentListRowProps) {
  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState(false);

  async function handleView() {
    setOpening(true);
    try {
      const result = await getDocumentSignedUrl(document.id);
      if (result.success) {
        window.open(result.data.url, "_blank");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erro ao abrir documento");
    } finally {
      setOpening(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deleteRetailerDocument(document.id);
      if (result.success) {
        toast.success("Documento removido");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erro ao remover documento");
    } finally {
      setDeleting(false);
    }
  }

  const uploadDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(document.uploaded_at));

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <File className="text-muted-foreground size-4 shrink-0" />
        <div>
          <p className="text-sm font-medium">{document.file_name}</p>
          <p className="text-muted-foreground text-xs">
            {getDocTypeLabel(document.doc_type)} &middot; {uploadDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {document.verified_at && (
          <Badge variant="default" className="text-xs">
            Verificado
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleView}
          disabled={opening}
          title="Visualizar"
        >
          {opening ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ExternalLink className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          title="Remover"
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="text-destructive size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
