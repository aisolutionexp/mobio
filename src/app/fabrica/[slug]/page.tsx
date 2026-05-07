import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default async function FabricaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: factory } = await supabase
    .from("factories")
    .select(
      "id, name, slug, description, logo_path, cover_path, email, phone, website",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!factory) {
    notFound();
  }

  const initials = factory.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      {/* Hero */}
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar
          alt={factory.name}
          fallback={initials}
          size="xl"
          shape="square"
          src={factory.logo_path ?? undefined}
        />
        <Masthead
          eyebrow="Atelier"
          title={factory.name}
          description={factory.description ?? ""}
          withRule={false}
        />
      </div>

      <hr className="border-border my-8" />

      {/* Sobre */}
      <section className="mb-8">
        <Eyebrow as="p" className="mb-4" withRule>
          Sobre
        </Eyebrow>
        <Plate>
          <p className="text-muted-foreground text-base leading-relaxed">
            {factory.description ??
              "Este atelier ainda não adicionou uma descrição. Volte em breve para saber mais sobre sua história e coleções."}
          </p>
        </Plate>
      </section>

      {/* Coleções */}
      <section className="mb-8">
        <Eyebrow as="p" className="mb-4" withRule>
          Coleções
        </Eyebrow>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Plate key={i}>
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Plate>
          ))}
        </div>
      </section>

      {/* Contato */}
      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          Contato
        </Eyebrow>
        <Plate>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                E-mail
              </dt>
              <dd className="mt-1 text-sm">
                {factory.email ?? "Não informado"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Telefone
              </dt>
              <dd className="mt-1 text-sm">
                {factory.phone ?? "Não informado"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Website
              </dt>
              <dd className="mt-1 text-sm">
                {factory.website ?? "Não informado"}
              </dd>
            </div>
          </dl>
        </Plate>
      </section>
    </div>
  );
}
