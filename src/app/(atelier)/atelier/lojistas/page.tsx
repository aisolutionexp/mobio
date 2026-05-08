import { UserPlus, Store, Mail } from "lucide-react";

import {
  listFactoryInvitations,
  listAuthorizedRetailers,
} from "@/lib/actions/factory-invitations";
import { Masthead } from "@/components/editorial/masthead";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InviteRetailerDrawer } from "@/components/domain/factory/invite-retailer-drawer";
import { AuthorizedRetailerCard } from "@/components/domain/factory/authorized-retailer-card";
import { FactoryInvitationCard } from "@/components/domain/factory/factory-invitation-card";

export default async function RetailersPage() {
  const [invitations, authorizedRetailers] = await Promise.all([
    listFactoryInvitations(),
    listAuthorizedRetailers(),
  ]);

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Comércio"
        title="Lojistas autorizadas"
        description="Gerencie os lojistas autorizados a comprar da sua fábrica"
        actions={
          <InviteRetailerDrawer>
            <Button variant="accent" leftIcon={<UserPlus className="size-4" />}>
              Convidar lojista
            </Button>
          </InviteRetailerDrawer>
        }
      />

      <Tabs defaultValue="authorized">
        <TabsList>
          <TabsTrigger value="authorized" icon={<Store className="size-4" />}>
            Autorizados ({authorizedRetailers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" icon={<Mail className="size-4" />}>
            Convites ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="authorized">
          {authorizedRetailers.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <Store className="text-muted-foreground/50 size-10" />
              <p className="text-sm">Nenhum lojista autorizado ainda</p>
              <p className="text-xs">
                Convide lojistas para que possam visualizar seu catálogo e fazer
                pedidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {authorizedRetailers.map((ar) => {
                const retailer = ar.retailers as unknown as {
                  id: string;
                  name: string;
                  slug: string;
                  logo_path: string | null;
                  email: string | null;
                } | null;

                return (
                  <AuthorizedRetailerCard
                    key={`${ar.factory_id}-${ar.retailer_id}`}
                    factoryId={ar.factory_id}
                    retailerId={ar.retailer_id}
                    retailerName={retailer?.name ?? "Lojista"}
                    retailerEmail={retailer?.email ?? null}
                    retailerLogoPath={retailer?.logo_path ?? null}
                    authorizedAt={ar.authorized_at}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations">
          {invitations.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <Mail className="text-muted-foreground/50 size-10" />
              <p className="text-sm">Nenhum convite enviado</p>
              <p className="text-xs">
                Use o botão acima para convidar lojistas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <FactoryInvitationCard
                  key={inv.id}
                  id={inv.id}
                  retailerEmail={inv.retailer_email}
                  retailerName={inv.retailer_name}
                  status={inv.status}
                  createdAt={inv.created_at}
                  expiresAt={inv.expires_at}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
