import { notFound } from "next/navigation";

import {
  getFactoryBySlug,
  isUserAuthorizedForFactory,
} from "@/lib/actions/factory-page";
import { FactoryAuthorizedView } from "@/components/domain/factory/factory-authorized-view";
import { FactoryPublicView } from "@/components/domain/factory/factory-public-view";

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
