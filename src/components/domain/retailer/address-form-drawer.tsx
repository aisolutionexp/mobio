"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";

import { addRetailerAddress } from "@/lib/actions/retailer-addresses";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Select } from "@/components/ui/select";
import { Eyebrow } from "@/components/editorial/eyebrow";

const UF_OPTIONS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
].map((uf) => ({ value: uf, label: uf }));

interface AddressFormDrawerProps {
  children: React.ReactNode;
  defaultValues?: {
    id?: string;
    label?: string;
    recipient_name?: string;
    address_line?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    is_default?: boolean;
  };
}

export function AddressFormDrawer({
  children,
  defaultValues,
}: AddressFormDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedState, setSelectedState] = React.useState(
    defaultValues?.state ?? "",
  );

  async function handleSubmit(formData: FormData) {
    formData.set("state", selectedState);
    setSubmitting(true);
    setError(null);

    const result = await addRetailerAddress(null, formData);

    setSubmitting(false);

    if (result.success) {
      toast.success(
        defaultValues?.id ? "Endereço atualizado" : "Endereço adicionado",
      );
      setOpen(false);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  function handleClose() {
    setOpen(false);
    setError(null);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(val) => (val ? setOpen(true) : handleClose())}
    >
      <Dialog.Trigger render={children as React.ReactElement} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity" />
        <Dialog.Popup className="bg-card border-border fixed inset-y-0 right-0 z-60 flex w-full max-w-md flex-col border-l shadow-lg">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <Eyebrow as="span">
              {defaultValues?.id ? "Editar endereço" : "Novo endereço"}
            </Eyebrow>
            <Dialog.Close
              className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form action={handleSubmit} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <TextInput
                name="label"
                label="Nome do endereço"
                placeholder="Ex: Escritório, Depósito"
                required
                defaultValue={defaultValues?.label}
              />

              <TextInput
                name="recipient_name"
                label="Destinatário"
                placeholder="Nome de quem irá receber"
                required
                minLength={2}
                defaultValue={defaultValues?.recipient_name}
              />

              <TextInput
                name="address_line"
                label="Endereço"
                placeholder="Rua, número"
                required
                minLength={3}
                defaultValue={defaultValues?.address_line}
              />

              <TextInput
                name="complement"
                label="Complemento"
                placeholder="Apto, bloco, sala"
                defaultValue={defaultValues?.complement}
              />

              <TextInput
                name="neighborhood"
                label="Bairro"
                required
                minLength={2}
                defaultValue={defaultValues?.neighborhood}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  name="city"
                  label="Cidade"
                  required
                  minLength={2}
                  defaultValue={defaultValues?.city}
                />
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Select
                    options={UF_OPTIONS}
                    value={selectedState}
                    onValueChange={setSelectedState}
                    placeholder="UF"
                    name="state"
                    required
                  />
                </div>
              </div>

              <TextInput
                name="zip_code"
                label="CEP"
                placeholder="00000-000"
                required
                pattern="\d{5}-?\d{3}"
                defaultValue={defaultValues?.zip_code}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_default"
                  value="true"
                  defaultChecked={defaultValues?.is_default}
                  className="accent-accent size-4 rounded"
                />
                Definir como endereço padrão
              </label>

              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
              <Dialog.Close
                render={<Button variant="outline" type="button" />}
                onClick={handleClose}
              >
                Cancelar
              </Dialog.Close>
              <Button type="submit" variant="accent" loading={submitting}>
                {defaultValues?.id ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
