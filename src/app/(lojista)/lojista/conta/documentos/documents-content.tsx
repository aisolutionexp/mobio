import { listRetailerDocuments } from "@/lib/actions/retailer-documents";
import { DocumentsClient } from "./documents-client";

const REQUIRED_DOCS = [
  { type: "cnpj_card", label: "Cartão CNPJ" },
  { type: "contrato_social", label: "Contrato Social" },
  { type: "inscricao_estadual", label: "Inscrição Estadual" },
] as const;

export async function DocumentsContent() {
  const documents = await listRetailerDocuments();

  const requiredDocs = REQUIRED_DOCS.map((req) => ({
    ...req,
    document: documents.find((d) => d.doc_type === req.type) ?? null,
  }));

  const otherDocs = documents.filter((d) => d.doc_type === "outros");

  return <DocumentsClient requiredDocs={requiredDocs} otherDocs={otherDocs} />;
}
