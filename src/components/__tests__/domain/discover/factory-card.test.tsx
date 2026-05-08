import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/actions/favorites", () => ({
  toggleFavoriteFactory: vi.fn(),
  toggleFavoriteProduct: vi.fn(),
}));

import { FactoryCard } from "@/components/domain/discover/factory-card";

const mockFactory = {
  id: "f1",
  name: "Atelier Couro",
  slug: "atelier-couro",
  logo_path: null,
  description: "Fabricante de couro premium",
  regionName: "Sul",
  categories: [
    { id: "c1", name: "Calçados", slug: "calcados" },
    { id: "c2", name: "Bolsas", slug: "bolsas" },
  ],
};

describe("FactoryCard", () => {
  it("renders factory name", () => {
    render(<FactoryCard factory={mockFactory} />);
    expect(screen.getByText("Atelier Couro")).toBeInTheDocument();
  });

  it("renders region name", () => {
    render(<FactoryCard factory={mockFactory} />);
    expect(screen.getByText("Sul")).toBeInTheDocument();
  });

  it("renders category badges", () => {
    render(<FactoryCard factory={mockFactory} />);
    expect(screen.getByText("Calçados")).toBeInTheDocument();
    expect(screen.getByText("Bolsas")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<FactoryCard factory={mockFactory} />);
    expect(screen.getByText("Fabricante de couro premium")).toBeInTheDocument();
  });

  it("renders link to factory page", () => {
    render(<FactoryCard factory={mockFactory} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/fabrica/atelier-couro");
  });

  it("renders favorite button", () => {
    render(<FactoryCard factory={mockFactory} />);
    expect(
      screen.getByRole("button", { name: /favoritos/i }),
    ).toBeInTheDocument();
  });
});
