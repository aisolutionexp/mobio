"use client";

import * as React from "react";
import { toast } from "sonner";

import { updateProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  published: { label: "Publicado", variant: "success" as const },
  archived: { label: "Arquivado", variant: "outline" as const },
} as const;

type Product = {
  id: string;
  name: string;
  reference: string | null;
  description: string | null;
  wholesale_price: number | null;
  status: string | null;
  created_at: string;
};

export function ProductDetailsForm({
  product,
  collectionId,
}: {
  product: Product;
  collectionId: string;
}) {
  const [submitting, setSubmitting] = React.useState(false);

  const boundAction = updateProduct.bind(null, product.id, collectionId);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    const result = await boundAction(null, formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Produto atualizado");
    } else {
      toast.error(result.error);
    }
  }

  const pStatus =
    STATUS_BADGE[(product.status as keyof typeof STATUS_BADGE) ?? "draft"] ??
    STATUS_BADGE.draft;

  return (
    <div className="mt-6 space-y-6">
      <Plate>
        <div className="mb-4 flex items-center justify-between">
          <Eyebrow as="p">Status</Eyebrow>
          <Badge variant={pStatus.variant}>{pStatus.label}</Badge>
        </div>
        <Rule spacing="sm" />
        <p className="text-muted-foreground mt-2 text-xs">
          Criado em{" "}
          {new Date(product.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </Plate>

      <Plate>
        <Eyebrow as="p" className="mb-4">
          Editar produto
        </Eyebrow>
        <form action={handleSubmit} className="space-y-4">
          <TextInput
            name="name"
            label="Nome do produto"
            defaultValue={product.name}
            required
            minLength={3}
            maxLength={200}
          />

          <TextInput
            name="sku"
            label="Referência (SKU)"
            defaultValue={product.reference ?? ""}
            required
            minLength={3}
            maxLength={50}
          />

          <Field>
            <FieldLabel htmlFor="product-description">Descrição</FieldLabel>
            <FieldControl>
              <Textarea
                id="product-description"
                name="description"
                defaultValue={product.description ?? ""}
                placeholder="Descreva o produto (opcional)"
                maxLength={1000}
                showCount
                autoResize
              />
            </FieldControl>
          </Field>

          <TextInput
            name="wholesale_price"
            label="Preço atacado (R$)"
            type="number"
            defaultValue={product.wholesale_price?.toString() ?? ""}
            placeholder="0,00"
            min={0}
            step={0.01}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="accent" loading={submitting}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </Plate>
    </div>
  );
}
