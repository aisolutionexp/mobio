import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-heading text-2xl font-semibold">
        Página não encontrada
      </h2>
      <p className="text-muted-foreground">
        A página que você procura não existe ou foi removida.
      </p>
      <Link href="/" className={buttonVariants()}>
        Voltar ao início
      </Link>
    </div>
  );
}
