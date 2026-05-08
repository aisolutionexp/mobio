import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { OrderStatusTimeline } from "@/components/domain/orders/order-status-timeline";
import type { StatusHistoryEntry } from "@/components/domain/orders/order-status-timeline";

function makeEntry(
  overrides: Partial<StatusHistoryEntry> = {},
): StatusHistoryEntry {
  return {
    id: crypto.randomUUID(),
    from_status: "pending",
    to_status: "processing",
    notes: null,
    created_at: new Date().toISOString(),
    changed_by: "user-1",
    ...overrides,
  };
}

describe("OrderStatusTimeline", () => {
  it("renders empty state when no history", () => {
    render(<OrderStatusTimeline history={[]} />);
    expect(
      screen.getByText(/nenhuma transição de status/i),
    ).toBeInTheDocument();
  });

  it("renders single history entry", () => {
    const entry = makeEntry({
      from_status: "pending",
      to_status: "processing",
    });
    render(<OrderStatusTimeline history={[entry]} />);
    expect(screen.getByText("Pendente")).toBeInTheDocument();
    expect(screen.getByText("Em produção")).toBeInTheDocument();
  });

  it("renders multiple entries sorted by date DESC", () => {
    const old = makeEntry({
      from_status: "pending",
      to_status: "processing",
      created_at: "2026-01-01T00:00:00Z",
    });
    const recent = makeEntry({
      from_status: "processing",
      to_status: "shipped",
      created_at: "2026-05-01T00:00:00Z",
    });
    render(<OrderStatusTimeline history={[old, recent]} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("renders notes when present", () => {
    const entry = makeEntry({ notes: "Motivo do cancelamento" });
    render(<OrderStatusTimeline history={[entry]} />);
    expect(screen.getByText("Motivo do cancelamento")).toBeInTheDocument();
  });

  it("shows new indicator when enabled", () => {
    const entry = makeEntry();
    render(<OrderStatusTimeline history={[entry]} showNewIndicator />);
    expect(screen.getByText(/atualizado agora/i)).toBeInTheDocument();
  });

  it("does not show new indicator by default", () => {
    const entry = makeEntry();
    render(<OrderStatusTimeline history={[entry]} />);
    expect(screen.queryByText(/atualizado agora/i)).not.toBeInTheDocument();
  });
});
