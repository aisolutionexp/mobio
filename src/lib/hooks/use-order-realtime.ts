"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StatusHistoryEntry } from "@/components/domain/orders/order-status-timeline";

interface UseOrderRealtimeOptions {
  orderId: string;
  initialHistory: StatusHistoryEntry[];
  initialStatus: string;
}

export function useOrderRealtime({
  orderId,
  initialHistory,
  initialStatus,
}: UseOrderRealtimeOptions) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>(initialHistory);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [showNewIndicator, setShowNewIndicator] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flashIndicator = useCallback(() => {
    setShowNewIndicator(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowNewIndicator(false), 4000);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_status_history",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newEntry = payload.new as StatusHistoryEntry;
          setHistory((prev) => {
            if (prev.some((e) => e.id === newEntry.id)) return prev;
            return [newEntry, ...prev];
          });
          flashIndicator();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as { status: string };
          setCurrentStatus(updated.status);
        },
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [orderId, flashIndicator]);

  return { history, currentStatus, showNewIndicator };
}
