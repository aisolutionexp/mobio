"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { verifyRetailer } from "@/lib/actions/admin-retailers";

interface VerifyRetailerDialogProps {
  retailerId: string;
  retailerName: string;
  decision: "verified" | "rejected";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyRetailerDialog({
  retailerId,
  retailerName,
  decision,
  open,
  onOpenChange,
}: VerifyRetailerDialogProps) {
  const [state, formAction, pending] = useActionState(verifyRetailer, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(
        decision === "verified"
          ? "Lojista verificado com sucesso"
          : "Verificação recusada",
      );
      onOpenChange(false);
    }
    if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, decision, onOpenChange]);

  const isReject = decision === "rejected";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) formRef.current?.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReject ? "Recusar verificação" : "Verificar lojista"}
          </DialogTitle>
          <DialogDescription>
            {isReject
              ? `Tem certeza que deseja recusar a verificação de "${retailerName}"?`
              : `Confirma a verificação de "${retailerName}"?`}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction}>
          <input type="hidden" name="retailerId" value={retailerId} />
          <input type="hidden" name="decision" value={decision} />

          <div className="space-y-4">
            <div>
              <label htmlFor="verify-notes" className="text-sm font-medium">
                Notas {isReject ? "(obrigatório)" : "(opcional)"}
              </label>
              <Textarea
                id="verify-notes"
                name="notes"
                placeholder={
                  isReject
                    ? "Descreva o motivo da recusa..."
                    : "Observações sobre a verificação..."
                }
                rows={3}
                maxLength={500}
                required={isReject}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={isReject ? "destructive" : "default"}
              disabled={pending}
            >
              {pending ? "Processando..." : isReject ? "Recusar" : "Verificar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
