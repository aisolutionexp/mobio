import { CreditCard, Calendar, Receipt } from "lucide-react";
import { Plate } from "@/components/editorial/plate";
import { PaymentStatusBadge } from "@/components/domain/payments/payment-status-badge";

function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

const METHOD_LABELS: Record<string, string> = {
  pix: "PIX",
  boleto: "Boleto",
  transfer: "Transferência",
  credit_card: "Cartão de crédito",
  other: "Outro",
};

interface PaymentRecord {
  id: string;
  amount_cents: number;
  paid_at: string;
  payment_method: string;
  transaction_ref: string | null;
  created_at: string;
}

interface PaymentSchedule {
  id: string;
  order_id: string;
  total_cents: number;
  signal_pct: number;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  payment_records: PaymentRecord[];
}

interface PaymentScheduleDisplayProps {
  schedules: PaymentSchedule[];
  currency?: string;
}

export function PaymentScheduleDisplay({
  schedules,
  currency = "BRL",
}: PaymentScheduleDisplayProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-center">
        <CreditCard className="size-8 opacity-50" />
        <p className="text-sm">Nenhuma agenda de pagamento definida</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => {
        const signalCents = Math.round(
          (schedule.total_cents * schedule.signal_pct) / 100,
        );
        const remainingCents = schedule.total_cents - signalCents;
        const totalPaid = schedule.payment_records.reduce(
          (sum, r) => sum + r.amount_cents,
          0,
        );

        return (
          <div key={schedule.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="text-muted-foreground size-4" />
                <span className="text-sm font-medium">
                  Total: {formatCurrency(schedule.total_cents, currency)}
                </span>
              </div>
              <PaymentStatusBadge status={schedule.status} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">
                  Sinal ({schedule.signal_pct}%)
                </p>
                <p className="font-heading text-base font-semibold">
                  {formatCurrency(signalCents, currency)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">
                  Restante ({100 - schedule.signal_pct}%)
                </p>
                <p className="font-heading text-base font-semibold">
                  {formatCurrency(remainingCents, currency)}
                </p>
              </div>
            </div>

            {schedule.due_date && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="size-4" />
                Vencimento: {formatDate(schedule.due_date)}
              </div>
            )}

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Receipt className="size-4" />
              Pago: {formatCurrency(totalPaid, currency)} de{" "}
              {formatCurrency(schedule.total_cents, currency)}
            </div>

            {schedule.payment_records.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Registros de pagamento
                </p>
                {schedule.payment_records.map((record) => (
                  <div
                    key={record.id}
                    className="border-border flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrency(record.amount_cents, currency)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {METHOD_LABELS[record.payment_method] ??
                          record.payment_method}
                        {record.transaction_ref &&
                          ` · Ref: ${record.transaction_ref}`}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(record.paid_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
