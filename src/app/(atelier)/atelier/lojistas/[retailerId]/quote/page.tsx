import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireFactoryAccess } from "@/lib/services/active-tenant";
import { listFactoryProducts } from "@/lib/actions/quotes";
import { Masthead } from "@/components/editorial/masthead";
import { QuoteForm } from "@/components/domain/quotes/quote-form";

export default async function NewQuotePage({
  params,
}: {
  params: Promise<{ retailerId: string }>;
}) {
  const { retailerId } = await params;
  const { tenantId } = await requireFactoryAccess();
  const supabase = await createClient();

  const { data: authorization, error } = await supabase
    .from("authorized_retailers")
    .select("retailer_id, retailers(id, name)")
    .eq("factory_id", tenantId)
    .eq("retailer_id", retailerId)
    .eq("status", "active")
    .single();

  if (error || !authorization) notFound();

  const retailer = authorization.retailers as unknown as {
    id: string;
    name: string;
  } | null;

  const products = await listFactoryProducts();

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Cotações"
        title={`Nova cotação para ${retailer?.name ?? "Lojista"}`}
        description="Selecione os produtos, defina quantidades e preços"
      />

      <QuoteForm
        retailerId={retailerId}
        retailerName={retailer?.name ?? "Lojista"}
        products={products}
      />
    </div>
  );
}
