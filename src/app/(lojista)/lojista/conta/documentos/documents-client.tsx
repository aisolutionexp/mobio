"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { DocumentUploadCard } from "@/components/domain/retailer/document-upload-card";
import { DocumentListRow } from "@/components/domain/retailer/document-list-row";
import { UploadDocumentDrawer } from "@/components/domain/retailer/upload-document-drawer";
import { getDocumentSignedUrl } from "@/lib/actions/retailer-documents";
import { toast } from "sonner";

interface RequiredDoc {
  type: string;
  label: string;
  document: {
    id: string;
    file_name: string;
    uploaded_at: string;
    verified_at: string | null;
  } | null;
}

interface OtherDoc {
  id: string;
  doc_type: string;
  file_name: string;
  uploaded_at: string;
  verified_at: string | null;
}

interface DocumentsClientProps {
  requiredDocs: RequiredDoc[];
  otherDocs: OtherDoc[];
}

export function DocumentsClient({
  requiredDocs,
  otherDocs,
}: DocumentsClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preselectedDocType, setPreselectedDocType] = useState<string>();

  function handleUpload(docType: string) {
    setPreselectedDocType(docType);
    setDrawerOpen(true);
  }

  async function handleView(docId: string) {
    const result = await getDocumentSignedUrl(docId);
    if (result.success) {
      window.open(result.data.url, "_blank");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <section className="space-y-4">
        <Eyebrow>Documentos exigidos</Eyebrow>
        <div className="space-y-3">
          {requiredDocs.map((rd) => (
            <DocumentUploadCard
              key={rd.type}
              docType={rd.type}
              label={rd.label}
              document={rd.document}
              onUpload={handleUpload}
              onView={handleView}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Outros documentos</Eyebrow>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpload("outros")}
            className="gap-2"
          >
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>

        {otherDocs.length > 0 ? (
          <Plate>
            {otherDocs.map((doc) => (
              <DocumentListRow key={doc.id} document={doc} />
            ))}
          </Plate>
        ) : (
          <Plate>
            <p className="text-muted-foreground py-4 text-center text-sm">
              Nenhum documento adicional enviado
            </p>
          </Plate>
        )}
      </section>

      <UploadDocumentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        preselectedDocType={preselectedDocType}
      />
    </>
  );
}
