import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";

export default function AdminFabricasPage() {
  return (
    <div className="space-y-8">
      <Masthead eyebrow="Admin" title="Fábricas" />
      <Plate title="Em breve">
        <p className="text-muted-foreground text-sm">
          Gerenciamento de fábricas estará disponível em breve.
        </p>
      </Plate>
    </div>
  );
}
