import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PublicLinesheetView } from "@/components/domain/linesheets/public-linesheet-view";
import { getPublicLinesheetData } from "@/lib/actions/linesheet-public";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const data = await getPublicLinesheetData(token);
  if (!data) return { title: "Linesheet" };

  const title = `${data.name} — MOBIO`;
  const description = `Linesheet de ${data.factoryName} com ${data.items.length} ${data.items.length === 1 ? "produto" : "produtos"}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default async function PublicLinesheetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPublicLinesheetData(token);

  if (!data) {
    notFound();
  }

  return <PublicLinesheetView data={data} />;
}
