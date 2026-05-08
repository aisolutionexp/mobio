"use client";

import { Upload, FileCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plate } from "@/components/editorial/plate";

interface DocumentUploadCardProps {
  docType: string;
  label: string;
  document?: {
    id: string;
    file_name: string;
    uploaded_at: string;
    verified_at: string | null;
  } | null;
  onUpload: (docType: string) => void;
  onView: (docId: string) => void;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  cnpj_card: "Cartão CNPJ",
  contrato_social: "Contrato Social",
  inscricao_estadual: "Inscrição Estadual",
  outros: "Outros",
};

export function getDocTypeLabel(docType: string): string {
  return DOC_TYPE_LABELS[docType] ?? docType;
}

export function DocumentUploadCard({
  docType,
  label,
  document,
  onUpload,
  onView,
}: DocumentUploadCardProps) {
  const hasDoc = !!document;
  const isVerified = !!document?.verified_at;

  return (
    <Plate className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {hasDoc ? (
          <FileCheck className="text-success size-5 shrink-0" />
        ) : (
          <Upload className="text-muted-foreground size-5 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {hasDoc && (
            <p className="text-muted-foreground text-xs">
              {document.file_name}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasDoc && (
          <Badge variant={isVerified ? "default" : "secondary"}>
            {isVerified ? (
              <>
                <FileCheck className="mr-1 size-3" /> Verificado
              </>
            ) : (
              <>
                <Clock className="mr-1 size-3" /> Pendente
              </>
            )}
          </Badge>
        )}
        {hasDoc ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(document.id)}
          >
            Visualizar
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => onUpload(docType)}>
            Enviar
          </Button>
        )}
      </div>
    </Plate>
  );
}
