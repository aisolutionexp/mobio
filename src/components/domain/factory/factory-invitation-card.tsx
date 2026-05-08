"use client";

import * as React from "react";
import { Check, RefreshCw, Ban } from "lucide-react";
import { toast } from "sonner";

import {
  revokeFactoryInvitation,
  resendFactoryInvitation,
} from "@/lib/actions/factory-invitations";
import { Plate } from "@/components/editorial/plate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FactoryInvitationCardProps {
  id: string;
  retailerEmail: string;
  retailerName: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
}

const STATUS_BADGE: Record<
  string,
  {
    variant: "warning" | "destructive" | "success" | "secondary";
    label: string;
  }
> = {
  pending: { variant: "warning", label: "Pendente" },
  revoked: { variant: "destructive", label: "Revogado" },
  expired: { variant: "secondary", label: "Expirado" },
  accepted: { variant: "success", label: "Aceito" },
};

export function FactoryInvitationCard({
  id,
  retailerEmail,
  retailerName,
  status,
  createdAt,
  expiresAt,
}: FactoryInvitationCardProps) {
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const isExpired = status === "pending" && new Date(expiresAt) < new Date();
  const displayStatus = isExpired ? "expired" : status;
  const badge = STATUS_BADGE[displayStatus] ?? STATUS_BADGE.pending;

  async function handleResend() {
    setLoading(true);
    const result = await resendFactoryInvitation(id);
    setLoading(false);

    if (result.success) {
      toast.success("Convite reenviado");
      await navigator.clipboard.writeText(result.data.invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(result.error);
    }
  }

  async function handleRevoke() {
    setLoading(true);
    const result = await revokeFactoryInvitation(id);
    setLoading(false);

    if (result.success) {
      toast.success("Convite revogado");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Plate className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-heading truncate text-sm font-semibold">
          {retailerName ?? retailerEmail}
        </p>
        {retailerName && (
          <p className="text-muted-foreground truncate text-xs">
            {retailerEmail}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          Enviado em {new Date(createdAt).toLocaleDateString("pt-BR")} — Expira
          em {new Date(expiresAt).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <Badge variant={badge.variant} size="sm" dot>
        {badge.label}
      </Badge>

      {displayStatus === "pending" && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            loading={loading}
            onClick={handleResend}
            leftIcon={
              copied ? (
                <Check className="size-3.5" />
              ) : (
                <RefreshCw className="size-3.5" />
              )
            }
          >
            {copied ? "Copiado" : "Reenviar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            loading={loading}
            onClick={handleRevoke}
            leftIcon={<Ban className="size-3.5" />}
          >
            Revogar
          </Button>
        </div>
      )}

      {(displayStatus === "expired" || displayStatus === "revoked") && (
        <Button
          variant="ghost"
          size="sm"
          loading={loading}
          onClick={handleResend}
          leftIcon={<RefreshCw className="size-3.5" />}
        >
          Reenviar
        </Button>
      )}
    </Plate>
  );
}
