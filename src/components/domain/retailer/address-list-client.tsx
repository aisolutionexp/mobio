"use client";

import { AddressCard } from "@/components/domain/retailer/address-card";

interface Address {
  id: string;
  label: string;
  recipient_name: string;
  address_line: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

export function AddressListClient({ addresses }: { addresses: Address[] }) {
  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <AddressCard
          key={addr.id}
          id={addr.id}
          label={addr.label}
          recipientName={addr.recipient_name}
          addressLine={addr.address_line}
          complement={addr.complement}
          neighborhood={addr.neighborhood}
          city={addr.city}
          state={addr.state}
          zipCode={addr.zip_code}
          isDefault={addr.is_default}
          onEdit={() => {
            // Edit drawer will be implemented in future sprint
          }}
        />
      ))}
    </div>
  );
}
