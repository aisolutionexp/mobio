import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "accent" }
> = {
  draft: { label: "Rascunho", variant: "default" },
  issued: { label: "Emitido", variant: "accent" },
  paid: { label: "Pago", variant: "success" },
};

interface StatementStatusBadgeProps {
  status: string;
}

export function StatementStatusBadge({ status }: StatementStatusBadgeProps) {
  const mapped = STATUS_MAP[status] ?? {
    label: status,
    variant: "default" as const,
  };
  return (
    <Badge variant={mapped.variant} size="sm">
      {mapped.label}
    </Badge>
  );
}
