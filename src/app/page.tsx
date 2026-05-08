import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "MOBIO — Fashion Marketplace B2B",
  description:
    "Marketplace B2B de moda que conecta atelies e fabricas a lojistas multimarca. Descubra parceiros, monte linesheets e gerencie pedidos.",
  openGraph: {
    title: "MOBIO — Fashion Marketplace B2B",
    description:
      "Marketplace B2B de moda que conecta atelies e fabricas a lojistas multimarca.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOBIO — Fashion Marketplace B2B",
    description:
      "Marketplace B2B de moda que conecta atelies e fabricas a lojistas multimarca.",
  },
};

export default function Home() {
  return (
    <main
      id="main-content"
      className="bg-background flex flex-1 flex-col items-center justify-center gap-12 p-8"
    >
      <header className="text-center">
        <h1 className="font-heading text-primary text-5xl font-bold tracking-tight">
          MOBIO
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Fashion marketplace B2B — conecta ateliês e fábricas a lojistas
          multimarca
        </p>
      </header>

      <section className="flex flex-col items-center gap-6">
        <div className="flex gap-3">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destrutivo</Button>
        </div>

        <div className="flex gap-3">
          <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-lg text-xs">
            Primary
          </div>
          <div className="bg-secondary text-secondary-foreground flex h-16 w-16 items-center justify-center rounded-lg text-xs">
            Secondary
          </div>
          <div className="bg-accent text-accent-foreground flex h-16 w-16 items-center justify-center rounded-lg text-xs">
            Accent
          </div>
          <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-lg text-xs">
            Muted
          </div>
          <div className="bg-destructive flex h-16 w-16 items-center justify-center rounded-lg text-xs text-white">
            Destruct
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="font-heading text-card-foreground text-2xl font-semibold">
            Tipografia
          </h2>
          <p className="text-muted-foreground mt-2">
            Heading: Fraunces (serif) | Body: Inter (sans-serif)
          </p>
        </div>
      </section>
    </main>
  );
}
