import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "outline" | "warning" | "success" | "destructive" }
> = {
  unverified: { label: "Não verificado", variant: "outline" },
  pending: { label: "Pendente", variant: "warning" },
  verified: { label: "Verificado", variant: "success" },
  rejected: { label: "Recusado", variant: "destructive" },
};

export function VerificationBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unverified;
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
