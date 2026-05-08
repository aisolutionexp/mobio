"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";

export function ShowroomTabs({
  slotsContent,
  bookingsContent,
}: {
  slotsContent: React.ReactNode;
  bookingsContent: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="slots">
      <Tabs.List>
        <Tabs.Trigger value="slots">Slots</Tabs.Trigger>
        <Tabs.Trigger value="bookings">Reservas</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="slots">{slotsContent}</Tabs.Content>
      <Tabs.Content value="bookings">{bookingsContent}</Tabs.Content>
    </Tabs>
  );
}
