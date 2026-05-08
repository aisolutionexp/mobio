import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro de Atelie",
  description:
    "Cadastre seu atelie ou fabrica no MOBIO e conecte-se a lojistas multimarca de todo o Brasil.",
  openGraph: {
    title: "Cadastro de Atelie | MOBIO",
    description:
      "Cadastre seu atelie ou fabrica no MOBIO e conecte-se a lojistas multimarca de todo o Brasil.",
  },
};

export default function CadastroFabricaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
