import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import { ShowroomCard } from "@/components/domain/showroom/showroom-card";

const BASE_SHOWROOM = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Showroom Verão 2027",
  type: "physical",
  event_date: null,
  location: null,
  capacity: null,
  status: "draft",
};

describe("ShowroomCard", () => {
  it("renders showroom name", () => {
    render(<ShowroomCard showroom={BASE_SHOWROOM} />);
    expect(screen.getByText("Showroom Verão 2027")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<ShowroomCard showroom={BASE_SHOWROOM} />);
    expect(screen.getByText("Rascunho")).toBeInTheDocument();
  });

  it("renders link to showroom detail", () => {
    render(<ShowroomCard showroom={BASE_SHOWROOM} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      `/atelier/showroom/${BASE_SHOWROOM.id}`,
    );
  });

  it("renders location when provided", () => {
    render(
      <ShowroomCard
        showroom={{ ...BASE_SHOWROOM, location: "São Paulo, SP" }}
      />,
    );
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
  });

  it("renders capacity when provided", () => {
    render(<ShowroomCard showroom={{ ...BASE_SHOWROOM, capacity: 50 }} />);
    expect(screen.getByText("50 vagas")).toBeInTheDocument();
  });

  it("renders slots count when provided", () => {
    render(<ShowroomCard showroom={BASE_SHOWROOM} slotsCount={3} />);
    expect(screen.getByText("3 slots")).toBeInTheDocument();
  });

  it("renders bookings count when provided", () => {
    render(<ShowroomCard showroom={BASE_SHOWROOM} bookingsCount={1} />);
    expect(screen.getByText("1 reserva")).toBeInTheDocument();
  });
});
