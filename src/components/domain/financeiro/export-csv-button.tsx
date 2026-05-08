"use client";

import { useState, useCallback } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CsvExportPayload } from "@/lib/actions/csv-export";

interface ExportCsvButtonProps {
  getExportData: () => Promise<CsvExportPayload>;
  label?: string;
}

export function ExportCsvButton({
  getExportData,
  label = "Exportar CSV",
}: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      const { endpoint, body, token } = await getExportData();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Falha ao exportar");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+?)"/);
      const filename = filenameMatch?.[1] ?? "export.csv";

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (error) {
      toast.error("Falha ao exportar CSV");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getExportData]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      leftIcon={<Download className="size-3.5" />}
    >
      {loading ? "Exportando..." : label}
    </Button>
  );
}
