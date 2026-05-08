"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  acceptQuote,
  rejectRetailerQuote,
  requestQuoteRevision,
} from "@/lib/actions/quotes-retailer";

export function RetailerQuoteActions({
  quoteId,
  status,
}: {
  quoteId: string;
  status: string;
}) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [revisionOpen, setRevisionOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<string | null>(null);
  const [revisionMessage, setRevisionMessage] = React.useState("");
  const [rejectReason, setRejectReason] = React.useState("");

  const isSent = status === "sent";

  async function handleAccept() {
    setLoading("accept");
    const result = await acceptQuote(quoteId);
    setLoading(null);

    if (result.success) {
      toast.success("Cotação aceita! Pedido gerado.");
      router.push(`/lojista/pedidos/${result.data.order_id}`);
    } else {
      toast.error(result.error);
    }
  }

  async function handleReject() {
    setLoading("reject");
    const result = await rejectRetailerQuote(
      quoteId,
      rejectReason || undefined,
    );
    setLoading(null);

    if (result.success) {
      toast.success("Cotação recusada");
      setRejectOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRevision() {
    if (!revisionMessage.trim()) return;

    setLoading("revision");
    const result = await requestQuoteRevision(quoteId, revisionMessage.trim());
    setLoading(null);

    if (result.success) {
      toast.success("Solicitação de revisão enviada");
      setRevisionOpen(false);
      setRevisionMessage("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (!isSent) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="accent"
          size="sm"
          loading={loading === "accept"}
          disabled={loading !== null}
          onClick={handleAccept}
        >
          <Check
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Aceitar e gerar pedido
        </Button>

        <Button
          variant="destructive"
          size="sm"
          disabled={loading !== null}
          onClick={() => setRejectOpen(true)}
        >
          <X aria-hidden="true" data-icon="inline-start" className="size-3.5" />
          Recusar
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => setRevisionOpen(true)}
        >
          <MessageSquare
            aria-hidden="true"
            data-icon="inline-start"
            className="size-3.5"
          />
          Solicitar revisão
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar cotação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja recusar esta cotação? Essa ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Motivo (opcional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="Informe o motivo da recusa..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              loading={loading === "reject"}
              onClick={handleReject}
            >
              Confirmar recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar revisão</DialogTitle>
            <DialogDescription>
              Envie uma mensagem para a fábrica solicitando ajustes na cotação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="revision-message">Mensagem</Label>
            <Textarea
              id="revision-message"
              placeholder="Descreva o que precisa ser revisado..."
              value={revisionMessage}
              onChange={(e) => setRevisionMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="accent"
              size="sm"
              loading={loading === "revision"}
              disabled={!revisionMessage.trim()}
              onClick={handleRevision}
            >
              Enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
