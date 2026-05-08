import { Suspense } from "react";
import { Masthead } from "@/components/editorial/masthead";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentsContent } from "./documents-content";

export default function DocumentosPage() {
  return (
    <div className="space-y-8">
      <Masthead
        eyebrow="Conta"
        title="Documentos da empresa"
        description="Envie documentos exigidos para verificação"
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        }
      >
        <DocumentsContent />
      </Suspense>
    </div>
  );
}
