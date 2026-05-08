import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getFactorySettings } from "@/lib/actions/factory-settings";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { Masthead } from "@/components/editorial/masthead";
import { FactorySettingsForm } from "@/components/domain/settings/factory-settings-form";

export default async function ConfiguracoesPage() {
  const { role } = await requireFactoryAccess();
  const isOwner = role === "atelier_owner" || role === "admin";

  const settingsResult = await getFactorySettings();

  if (!settingsResult.success) {
    throw new Error(settingsResult.error);
  }

  const supabase = await createClient();
  const { data: regions } = await supabase
    .from("regions")
    .select("id, name, code")
    .eq("country", "BR")
    .order("name", { ascending: true });

  return (
    <div className="space-y-8">
      <nav className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          href="/atelier/conta"
          className="hover:text-foreground transition-colors"
        >
          Configurações
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">
          Configurações comerciais
        </span>
      </nav>

      <Masthead
        title="Configurações comerciais"
        description="Defina suas políticas de pagamento, logística e termos comerciais"
      />

      <FactorySettingsForm
        initialData={settingsResult.data}
        regions={regions ?? []}
        readOnly={!isOwner}
      />
    </div>
  );
}
