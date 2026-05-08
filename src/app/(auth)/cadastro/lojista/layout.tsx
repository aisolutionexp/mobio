import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro de Lojista",
  description:
    "Cadastre sua loja no MOBIO e descubra atelies e fabricas de moda para abastecer seu estoque.",
  openGraph: {
    title: "Cadastro de Lojista | MOBIO",
    description:
      "Cadastre sua loja no MOBIO e descubra atelies e fabricas de moda para abastecer seu estoque.",
  },
};

export default function CadastroLojistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
