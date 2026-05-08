"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";

export function RetailerShowroomTabs({
  availableContent,
  bookingsContent,
}: {
  availableContent: React.ReactNode;
  bookingsContent: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="available">
      <Tabs.List>
        <Tabs.Trigger value="available">Disponíveis</Tabs.Trigger>
        <Tabs.Trigger value="bookings">Meus agendamentos</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="available">{availableContent}</Tabs.Content>
      <Tabs.Content value="bookings">{bookingsContent}</Tabs.Content>
    </Tabs>
  );
}
