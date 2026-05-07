import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const FEATURED_ATELIERS = [
  { name: "Atelier Aurora", region: "São Paulo, SP", initials: "AA" },
  { name: "Maison Celeste", region: "Rio de Janeiro, RJ", initials: "MC" },
  { name: "Studio Orion", region: "Belo Horizonte, MG", initials: "SO" },
  { name: "Casa Moda", region: "Curitiba, PR", initials: "CM" },
] as const;

export default function PracaPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      <Masthead
        eyebrow={greeting}
        title="Bem-vindo ao MOBIO"
        description="Explore o que há de novo na Praça"
      />

      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          Novidades
        </Eyebrow>
        <Plate>
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </Plate>
      </section>

      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          Ateliês em destaque
        </Eyebrow>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {FEATURED_ATELIERS.map((atelier) => (
            <Plate key={atelier.name} className="text-center">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  alt={atelier.name}
                  fallback={atelier.initials}
                  size="lg"
                  shape="square"
                />
                <p className="text-sm font-medium">{atelier.name}</p>
                <p className="text-muted-foreground text-xs">
                  {atelier.region}
                </p>
              </div>
            </Plate>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow as="p" className="mb-4" withRule>
          Seus Boards
        </Eyebrow>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Plate key={i}>
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </Plate>
          ))}
        </div>
      </section>
    </div>
  );
}
