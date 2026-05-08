"use client";

import { useOrderRealtime } from "@/lib/hooks/use-order-realtime";
import {
  OrderStatusTimeline,
  type StatusHistoryEntry,
} from "@/components/domain/orders/order-status-timeline";
import { OrderStatusBadge } from "@/components/domain/orders/order-status-badge";

interface OrderStatusTimelineRealtimeProps {
  orderId: string;
  initialHistory: StatusHistoryEntry[];
  initialStatus: string;
  showStatusBadge?: boolean;
}

export function OrderStatusTimelineRealtime({
  orderId,
  initialHistory,
  initialStatus,
  showStatusBadge = false,
}: OrderStatusTimelineRealtimeProps) {
  const { history, currentStatus, showNewIndicator } = useOrderRealtime({
    orderId,
    initialHistory,
    initialStatus,
  });

  return (
    <div className="space-y-3">
      {showStatusBadge && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Status atual:</span>
          <OrderStatusBadge status={currentStatus} />
        </div>
      )}
      <OrderStatusTimeline
        history={history}
        showNewIndicator={showNewIndicator}
      />
    </div>
  );
}
