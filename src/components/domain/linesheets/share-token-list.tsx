"use client";

import * as React from "react";
import { Copy, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { revokeShareToken } from "@/lib/actions/linesheet-share";
import type { ShareTokenData } from "@/lib/actions/linesheet-share";
import { Button } from "@/components/ui/button";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function ShareTokenList({ tokens }: { tokens: ShareTokenData[] }) {
  const [revokingId, setRevokingId] = React.useState<string | null>(null);

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  }

  async function handleRevoke(tokenId: string) {
    if (!confirm("Revogar este link de compartilhamento?")) return;
    setRevokingId(tokenId);
    const result = await revokeShareToken(tokenId);
    if (result.success) {
      toast.success("Link revogado");
    } else {
      toast.error(result.error);
    }
    setRevokingId(null);
  }

  if (tokens.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        Nenhum link de compartilhamento criado
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tokens.map((token) => {
        const expired = isExpired(token.expiresAt);
        const inactive = token.isRevoked || expired;

        return (
          <div
            key={token.id}
            className={`border-border flex items-center gap-3 rounded-lg border p-3 ${
              inactive ? "opacity-60" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <code className="text-muted-foreground truncate text-xs">
                  {token.url}
                </code>
                {token.isRevoked && (
                  <span className="bg-destructive/10 text-destructive rounded px-1.5 py-0.5 text-[10px] font-medium">
                    Revogado
                  </span>
                )}
                {expired && !token.isRevoked && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    Expirado
                  </span>
                )}
              </div>
              <div className="text-muted-foreground mt-1 flex gap-3 text-[11px]">
                <span>Criado em {formatDate(token.createdAt)}</span>
                {token.expiresAt && (
                  <span>Expira em {formatDate(token.expiresAt)}</span>
                )}
                <span>
                  {token.accessCount}{" "}
                  {token.accessCount === 1 ? "acesso" : "acessos"}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {!inactive && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleCopy(token.url)}
                    title="Copiar link"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => window.open(token.url, "_blank")}
                    title="Abrir link"
                  >
                    <ExternalLink className="size-3.5" />
                  </Button>
                </>
              )}
              {!token.isRevoked && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRevoke(token.id)}
                  disabled={revokingId === token.id}
                  title="Revogar link"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
