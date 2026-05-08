import Link from "next/link";
import { MapPin, Lock } from "lucide-react";

import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { getFactoryBySlug } from "@/lib/actions/factory-page";

type Factory = NonNullable<Awaited<ReturnType<typeof getFactoryBySlug>>>;

export function FactoryPublicView({
  factory,
  isLoggedIn,
}: {
  factory: Factory;
  isLoggedIn: boolean;
}) {
  const initials = factory.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 md:px-8">
      {/* Hero */}
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar
          alt={factory.name}
          fallback={initials}
          size="xl"
          shape="square"
          src={factory.logo_path ?? undefined}
        />
        <div className="space-y-1">
          <Eyebrow>Atelier</Eyebrow>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {factory.name}
          </h1>
          {factory.regionName && (
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <MapPin className="size-3.5" />
              {factory.regionName}
            </p>
          )}
        </div>
      </div>

      {/* Sobre */}
      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          Sobre
        </Eyebrow>
        <Plate>
          <p className="text-muted-foreground text-base leading-relaxed">
            {factory.description ??
              "Este atelier ainda não adicionou uma descrição."}
          </p>
          {factory.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {factory.categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </Plate>
      </section>

      {/* CTA */}
      <section>
        <Plate className="text-center" accent>
          <Lock className="text-muted-foreground mx-auto mb-3 size-8" />
          <h2 className="font-heading mb-2 text-lg font-semibold">
            Catálogo restrito
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            {isLoggedIn
              ? "Você ainda não tem acesso ao catálogo deste atelier. Solicite acesso para visualizar produtos, coleções e preços."
              : "Cadastre-se na plataforma para visualizar o catálogo completo deste atelier, incluindo produtos, coleções e preços."}
          </p>
          {isLoggedIn ? (
            <Button variant="accent" size="lg" disabled>
              Solicitar acesso ao catálogo
            </Button>
          ) : (
            <Button variant="accent" size="lg" render={<Link href="/login" />}>
              Cadastre-se para ver o catálogo
            </Button>
          )}
        </Plate>
      </section>
    </div>
  );
}
