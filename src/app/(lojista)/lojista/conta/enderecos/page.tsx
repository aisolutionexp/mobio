import { Plus, MapPin } from "lucide-react";

import { listRetailerAddresses } from "@/lib/actions/retailer-addresses";
import { Masthead } from "@/components/editorial/masthead";
import { Button } from "@/components/ui/button";
import { AddressFormDrawer } from "@/components/domain/retailer/address-form-drawer";
import { AddressListClient } from "@/components/domain/retailer/address-list-client";

export default async function RetailerAddressesPage() {
  const addresses = await listRetailerAddresses();

  return (
    <div className="space-y-6">
      <Masthead
        eyebrow="Conta"
        title="Endereços de entrega"
        description="Gerencie seus endereços para recebimento de pedidos"
        actions={
          <AddressFormDrawer>
            <Button variant="accent" leftIcon={<Plus className="size-4" />}>
              Adicionar endereço
            </Button>
          </AddressFormDrawer>
        }
      />

      {addresses.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <MapPin className="text-muted-foreground/50 size-10" />
          <p className="text-sm">Nenhum endereço cadastrado</p>
          <p className="text-xs">
            Adicione endereços de entrega para facilitar seus pedidos.
          </p>
        </div>
      ) : (
        <AddressListClient addresses={addresses} />
      )}
    </div>
  );
}
