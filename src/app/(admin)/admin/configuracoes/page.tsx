import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";

export default function AdminConfiguracoesPage() {
  return (
    <div className="space-y-8">
      <Masthead eyebrow="Admin" title="Configurações" />
      <Plate title="Em breve">
        <p className="text-muted-foreground text-sm">
          Configurações do sistema estarão disponíveis em breve.
        </p>
      </Plate>
    </div>
  );
}
