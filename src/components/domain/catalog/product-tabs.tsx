"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";

export function ProductTabs({
  photosTab,
  finishesTab,
  specsTab,
  detailsTab,
}: {
  photosTab: React.ReactNode;
  finishesTab: React.ReactNode;
  specsTab: React.ReactNode;
  detailsTab: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="photos">
      <Tabs.List>
        <Tabs.Trigger value="photos">Fotos</Tabs.Trigger>
        <Tabs.Trigger value="finishes">Acabamentos</Tabs.Trigger>
        <Tabs.Trigger value="specs">Specs</Tabs.Trigger>
        <Tabs.Trigger value="details">Detalhes</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="photos">{photosTab}</Tabs.Content>
      <Tabs.Content value="finishes">{finishesTab}</Tabs.Content>
      <Tabs.Content value="specs">{specsTab}</Tabs.Content>
      <Tabs.Content value="details">{detailsTab}</Tabs.Content>
    </Tabs>
  );
}
