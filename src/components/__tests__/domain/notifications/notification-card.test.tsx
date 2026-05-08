import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/actions/notifications", () => ({
  markAsRead: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  deleteNotification: vi
    .fn()
    .mockResolvedValue({ success: true, data: undefined }),
}));

import { NotificationCard } from "@/components/domain/notifications/notification-card";

const baseProps = {
  id: "n1",
  type: "order_status_changed",
  title: "Pedido atualizado",
  body: "Seu pedido foi enviado",
  link: "/lojista/pedidos/123",
  isRead: false,
  createdAt: new Date().toISOString(),
};

describe("NotificationCard", () => {
  it("renders title and body", () => {
    render(<NotificationCard {...baseProps} />);
    expect(screen.getByText("Pedido atualizado")).toBeInTheDocument();
    expect(screen.getByText("Seu pedido foi enviado")).toBeInTheDocument();
  });

  it("shows unread indicator when not read", () => {
    render(<NotificationCard {...baseProps} />);
    expect(screen.getByText(/marcar como lida/i)).toBeInTheDocument();
  });

  it("hides mark-as-read when already read", () => {
    render(<NotificationCard {...baseProps} isRead={true} />);
    expect(screen.queryByText(/marcar como lida/i)).not.toBeInTheDocument();
  });

  it("renders link", () => {
    render(<NotificationCard {...baseProps} />);
    const link = screen.getByText("Ver");
    expect(link).toHaveAttribute("href", "/lojista/pedidos/123");
  });
});
