import { Badge } from "@/components/ui/badge";
import type { AuditLogRow } from "@/lib/actions/audit-logs";

const OPERATION_COLORS: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  INSERT: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
};

const TABLE_LABELS: Record<string, string> = {
  factories: "Atelier",
  retailers: "Lojista",
  orders: "Pedido",
  team_members: "Membro",
  factory_settings: "Configuração",
  factory_invitations: "Convite",
  authorized_retailers: "Autorização",
  plans: "Plano",
  subscriptions: "Assinatura",
  statements: "Statement",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AuditLogRowProps {
  log: AuditLogRow;
  onSelect: (id: string) => void;
}

export function AuditLogRowItem({ log, onSelect }: AuditLogRowProps) {
  return (
    <tr
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes de ${log.operation} em ${TABLE_LABELS[log.table_name] ?? log.table_name}`}
      className="hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => onSelect(log.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(log.id);
        }
      }}
    >
      <td className="text-muted-foreground py-3 pr-4 text-sm">
        {formatDateTime(log.created_at)}
      </td>
      <td className="py-3 pr-4 text-sm">
        {TABLE_LABELS[log.table_name] ?? log.table_name}
      </td>
      <td className="py-3 pr-4">
        <Badge
          variant={OPERATION_COLORS[log.operation] ?? "secondary"}
          size="sm"
        >
          {log.operation}
        </Badge>
      </td>
      <td className="text-muted-foreground py-3 pr-4 font-mono text-xs">
        {log.record_id.slice(0, 8)}
      </td>
      <td className="text-muted-foreground py-3 font-mono text-xs">
        {log.actor_user_id?.slice(0, 8) ?? "sistema"}
      </td>
    </tr>
  );
}
