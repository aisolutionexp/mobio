import type { Metadata } from "next";
import { fontSans, fontDisplay } from "@/config/fonts";
import { Toaster } from "@/components/ui/toaster";
import { SkipLink } from "@/components/shared/skip-link";
import { LgpdBanner } from "@/components/shared/lgpd-banner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobio.com.br";

function getSupabaseHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MOBIO — Fashion Marketplace B2B",
    template: "%s | MOBIO",
  },
  description:
    "Marketplace B2B de moda que conecta ateliês e fábricas a lojistas multimarca. Descubra parceiros, monte linesheets e gerencie pedidos.",
  keywords: [
    "moda B2B",
    "marketplace moda",
    "atacado moda",
    "fábricas de moda",
    "lojistas multimarca",
    "linesheet",
    "ateliê",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "MOBIO",
    title: "MOBIO — Fashion Marketplace B2B",
    description:
      "Marketplace B2B de moda que conecta ateliês e fábricas a lojistas multimarca.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOBIO — Fashion Marketplace B2B",
    description:
      "Marketplace B2B de moda que conecta ateliês e fábricas a lojistas multimarca.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseHost = getSupabaseHostname();

  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <head>
        {supabaseHost && (
          <>
            <link rel="preconnect" href={`https://${supabaseHost}`} />
            <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
          </>
        )}
      </head>
      <body className="flex min-h-full flex-col">
        <SkipLink />
        {children}
        <Toaster />
        <LgpdBanner />
      </body>
    </html>
  );
}
