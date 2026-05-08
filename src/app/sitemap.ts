import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobio.com.br";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: `${baseUrl}/entrar`, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${baseUrl}/cadastro/fabrica`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cadastro/lojista`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const supabase = await createClient();
  const { data: factories } = await supabase
    .from("factories")
    .select("slug, updated_at")
    .eq("is_active", true);

  const factoryRoutes: MetadataRoute.Sitemap =
    factories?.map((f) => ({
      url: `${baseUrl}/fabrica/${f.slug}`,
      lastModified: f.updated_at ? new Date(f.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? [];

  return [...staticRoutes, ...factoryRoutes];
}
