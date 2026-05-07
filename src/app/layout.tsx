import type { Metadata } from "next";
import { fontSans, fontDisplay } from "@/config/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOBIO",
  description:
    "Fashion marketplace B2B — conecta ateliês e fábricas a lojistas multimarca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
