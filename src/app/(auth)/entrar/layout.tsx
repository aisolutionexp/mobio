import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Acesse sua conta no MOBIO — marketplace B2B de moda para atelies e lojistas.",
  openGraph: {
    title: "Entrar | MOBIO",
    description:
      "Acesse sua conta no MOBIO — marketplace B2B de moda para atelies e lojistas.",
  },
};

export default function EntrarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
