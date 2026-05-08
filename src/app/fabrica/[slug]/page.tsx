import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getFactoryBySlug,
  isUserAuthorizedForFactory,
} from "@/lib/actions/factory-page";
import { FactoryAuthorizedView } from "@/components/domain/factory/factory-authorized-view";
import { FactoryPublicView } from "@/components/domain/factory/factory-public-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const factory = await getFactoryBySlug(slug);

  if (!factory) {
    return { title: "Atelie nao encontrado" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobio.com.br";

  return {
    title: factory.name,
    description:
      factory.description ??
      `Conheca o atelie ${factory.name} no MOBIO — colecoes, produtos e contato.`,
    openGraph: {
      title: `${factory.name} | MOBIO`,
      description:
        factory.description ?? `Conheca o atelie ${factory.name} no MOBIO.`,
      url: `${siteUrl}/fabrica/${factory.slug}`,
      type: "profile",
      ...(factory.logo_path && { images: [{ url: factory.logo_path }] }),
    },
    twitter: {
      card: "summary",
      title: `${factory.name} | MOBIO`,
      description:
        factory.description ?? `Conheca o atelie ${factory.name} no MOBIO.`,
      ...(factory.logo_path && { images: [factory.logo_path] }),
    },
  };
}

export default async function FabricaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const factory = await getFactoryBySlug(slug);

  if (!factory) {
    notFound();
  }

  const auth = await isUserAuthorizedForFactory(factory.id);

  if (auth.authorized) {
    return <FactoryAuthorizedView factory={factory} />;
  }

  return <FactoryPublicView factory={factory} isLoggedIn={!!auth.userId} />;
}
