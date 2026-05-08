"use client";

import * as React from "react";
import { Link2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

import { createShareToken } from "@/lib/actions/linesheet-share";
import { Button } from "@/components/ui/button";

type ExpiresOption = 7 | 30 | null;

export function CreateShareTokenForm({ linesheetId }: { linesheetId: string }) {
  const [expiresIn, setExpiresIn] = React.useState<ExpiresOption>(null);
  const [loading, setLoading] = React.useState(false);
  const [createdUrl, setCreatedUrl] = React.useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setCreatedUrl(null);

    const result = await createShareToken(linesheetId, expiresIn);

    if (result.success) {
      setCreatedUrl(result.data.url);
      toast.success("Link criado com sucesso");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  async function handleCopy() {
    if (!createdUrl) return;
    await navigator.clipboard.writeText(createdUrl);
    toast.success("Link copiado");
  }

  return (
    <div className="border-border rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-medium">Criar novo link</h3>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="expires-select"
            className="text-muted-foreground mb-1 block text-xs"
          >
            Expira em
          </label>
          <select
            id="expires-select"
            value={expiresIn === null ? "never" : String(expiresIn)}
            onChange={(e) => {
              const val = e.target.value;
              setExpiresIn(val === "never" ? null : (Number(val) as 7 | 30));
            }}
            className="border-border bg-card rounded-md border px-3 py-1.5 text-sm"
          >
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="never">Nunca</option>
          </select>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Link2 className="mr-1.5 size-3.5" />
          )}
          {loading ? "Criando..." : "Criar link"}
        </Button>
      </div>

      {createdUrl && (
        <div className="bg-muted/50 mt-3 flex items-center gap-2 rounded-md p-2">
          <code className="min-w-0 flex-1 truncate text-xs">{createdUrl}</code>
          <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
            <Copy className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
