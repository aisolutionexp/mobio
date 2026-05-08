import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobio.com.br";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/entrar",
        "/cadastro/*",
        "/fabrica/*",
        "/politica-de-privacidade",
      ],
      disallow: [
        "/atelier/*",
        "/lojista/*",
        "/admin/*",
        "/api/*",
        "/onboarding",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
