"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

import { Plate } from "@/components/editorial/plate";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/domain/admin/verification-badge";
import { VerifyRetailerDialog } from "@/components/domain/admin/verify-retailer-dialog";
import type { RetailerRow } from "@/lib/actions/admin-retailers";

export function RetailerListRow({ retailer }: { retailer: RetailerRow }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [decision, setDecision] = useState<"verified" | "rejected">("verified");

  const openDialog = (d: "verified" | "rejected") => {
    setDecision(d);
    setDialogOpen(true);
  };

  const regionName = retailer.region?.name ?? "—";
  const createdAt = new Date(retailer.created_at).toLocaleDateString("pt-BR");

  return (
    <>
      <Plate className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading truncate text-sm font-semibold">
              {retailer.name}
            </h3>
            <VerificationBadge status={retailer.verification_status} />
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>Região: {regionName}</span>
            <span>Cadastro: {createdAt}</span>
            {retailer.email && <span>{retailer.email}</span>}
          </div>
        </div>

        {(retailer.verification_status === "pending" ||
          retailer.verification_status === "unverified") && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDialog("verified")}
            >
              <CheckCircle
                aria-hidden="true"
                data-icon="inline-start"
                className="size-3.5"
              />
              Verificar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDialog("rejected")}
            >
              <XCircle
                aria-hidden="true"
                data-icon="inline-start"
                className="size-3.5"
              />
              Recusar
            </Button>
          </div>
        )}
      </Plate>

      <VerifyRetailerDialog
        retailerId={retailer.id}
        retailerName={retailer.name}
        decision={decision}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
