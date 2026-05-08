"use client";

import { Tabs } from "@/components/ui/tabs";

interface FavoriteTabsProps {
  factoryCount: number;
  productCount: number;
  factoryContent: React.ReactNode;
  productContent: React.ReactNode;
}

export function FavoriteTabs({
  factoryCount,
  productCount,
  factoryContent,
  productContent,
}: FavoriteTabsProps) {
  return (
    <Tabs defaultValue="factories">
      <Tabs.List>
        <Tabs.Trigger value="factories">Atelies ({factoryCount})</Tabs.Trigger>
        <Tabs.Trigger value="products">Produtos ({productCount})</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="factories" className="pt-4">
        {factoryContent}
      </Tabs.Content>
      <Tabs.Content value="products" className="pt-4">
        {productContent}
      </Tabs.Content>
    </Tabs>
  );
}
