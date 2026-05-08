"use client";

import * as React from "react";
import { Store, MoreHorizontal, Ban } from "lucide-react";
import { toast } from "sonner";

import { revokeAuthorization } from "@/lib/actions/factory-invitations";
import { Plate } from "@/components/editorial/plate";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuthorizedRetailerCardProps {
  factoryId: string;
  retailerId: string;
  retailerName: string;
  retailerEmail: string | null;
  retailerLogoPath: string | null;
  authorizedAt: string;
}

export function AuthorizedRetailerCard({
  factoryId,
  retailerId,
  retailerName,
  retailerEmail,
  retailerLogoPath,
  authorizedAt,
}: AuthorizedRetailerCardProps) {
  const [confirming, setConfirming] = React.useState(false);
  const [revoking, setRevoking] = React.useState(false);

  async function handleRevoke() {
    setRevoking(true);
    const result = await revokeAuthorization(factoryId, retailerId);
    setRevoking(false);
    setConfirming(false);

    if (result.success) {
      toast.success("Autorização revogada");
    } else {
      toast.error(result.error);
    }
  }

  const initials = retailerName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Plate className="flex items-center gap-4">
      <Avatar
        src={retailerLogoPath ?? undefined}
        alt={retailerName}
        fallback={initials}
        size="md"
        shape="square"
      />
      <div className="min-w-0 flex-1">
        <p className="font-heading truncate text-sm font-semibold">
          {retailerName}
        </p>
        {retailerEmail && (
          <p className="text-muted-foreground truncate text-xs">
            {retailerEmail}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          Autorizado em {new Date(authorizedAt).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <Badge variant="success" size="sm" dot>
        Ativo
      </Badge>
      <div className="shrink-0">
        {confirming ? (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              loading={revoking}
              onClick={handleRevoke}
            >
              Confirmar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(true)}
            leftIcon={<Ban className="size-3.5" />}
          >
            Revogar
          </Button>
        )}
      </div>
    </Plate>
  );
}
