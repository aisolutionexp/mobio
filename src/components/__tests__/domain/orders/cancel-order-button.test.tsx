import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/lib/actions/orders-retailer", () => ({
  cancelOrder: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { CancelOrderButton } from "@/components/domain/orders/cancel-order-button";

describe("CancelOrderButton", () => {
  it("renders initial button", () => {
    render(<CancelOrderButton orderId="order-1" />);
    expect(
      screen.getByRole("button", { name: /solicitar cancelamento/i }),
    ).toBeInTheDocument();
  });

  it("shows confirmation when clicked", () => {
    render(<CancelOrderButton orderId="order-1" />);
    fireEvent.click(
      screen.getByRole("button", { name: /solicitar cancelamento/i }),
    );
    expect(screen.getByText(/confirmar cancelamento/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sim, cancelar/i }),
    ).toBeInTheDocument();
  });

  it("returns to initial state when clicking voltar", () => {
    render(<CancelOrderButton orderId="order-1" />);
    fireEvent.click(
      screen.getByRole("button", { name: /solicitar cancelamento/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(
      screen.getByRole("button", { name: /solicitar cancelamento/i }),
    ).toBeInTheDocument();
  });
});
