"use client";

import * as React from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { generateLinesheetPDF } from "@/lib/actions/linesheet-export";
import { Button } from "@/components/ui/button";

export function ExportPdfButton({ linesheetId }: { linesheetId: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const result = await generateLinesheetPDF(linesheetId);
      if (result.success) {
        window.open(result.data.url, "_blank");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erro ao gerar PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
      ) : (
        <FileDown className="mr-1.5 size-3.5" />
      )}
      {loading ? "Gerando..." : "Exportar PDF"}
    </Button>
  );
}
