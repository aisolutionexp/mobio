"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { uploadRetailerDocument } from "@/lib/actions/retailer-documents";
import { toast } from "sonner";

interface UploadDocumentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedDocType?: string;
}

const DOC_TYPE_OPTIONS = [
  { value: "cnpj_card", label: "Cartão CNPJ" },
  { value: "contrato_social", label: "Contrato Social" },
  { value: "inscricao_estadual", label: "Inscrição Estadual" },
  { value: "outros", label: "Outros" },
] as const;

export function UploadDocumentDrawer({
  open,
  onOpenChange,
  preselectedDocType,
}: UploadDocumentDrawerProps) {
  const [docType, setDocType] = useState(preselectedDocType ?? "outros");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit() {
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("doc_type", docType);

      const result = await uploadRetailerDocument(formData);
      if (result.success) {
        toast.success("Documento enviado com sucesso");
        setFile(null);
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erro ao enviar documento");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de documento</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {DOC_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Arquivo</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="border-input block w-full rounded-md border p-2 text-sm"
            />
            <p className="text-muted-foreground text-xs">
              PDF, JPEG ou PNG. Máximo 10MB.
            </p>
          </div>

          {file && (
            <p className="text-sm">
              Arquivo selecionado:{" "}
              <span className="font-medium">{file.name}</span> (
              {(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || !file}
            className="gap-2"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
