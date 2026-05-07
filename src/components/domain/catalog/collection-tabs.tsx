"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";

export function CollectionTabs({
  productsTab,
  detailsTab,
  activityTab,
}: {
  productsTab: React.ReactNode;
  detailsTab: React.ReactNode;
  activityTab: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="products">
      <Tabs.List>
        <Tabs.Trigger value="products">Produtos</Tabs.Trigger>
        <Tabs.Trigger value="details">Detalhes</Tabs.Trigger>
        <Tabs.Trigger value="activity">Atividade</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="products">{productsTab}</Tabs.Content>
      <Tabs.Content value="details">{detailsTab}</Tabs.Content>
      <Tabs.Content value="activity">{activityTab}</Tabs.Content>
    </Tabs>
  );
}
