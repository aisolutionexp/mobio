import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/actions/quotes", () => ({
  createQuote: vi.fn(),
  sendQuote: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { QuoteForm } from "@/components/domain/quotes/quote-form";

const mockProducts = [
  {
    id: "p1-uuid",
    name: "Bolsa Premium",
    reference: "BP-001",
    wholesale_price: 15000,
    retail_price: 30000,
  },
  {
    id: "p2-uuid",
    name: "Carteira Slim",
    reference: "CS-002",
    wholesale_price: 5000,
    retail_price: 10000,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("QuoteForm", () => {
  it("renders the form with product selection", () => {
    render(
      <QuoteForm
        retailerId="r1-uuid"
        retailerName="Loja Centro"
        products={mockProducts}
      />,
    );
    expect(screen.getByText("Produtos da cotação")).toBeInTheDocument();
  });

  it("renders valid_until date input", () => {
    render(
      <QuoteForm
        retailerId="r1-uuid"
        retailerName="Loja Centro"
        products={mockProducts}
      />,
    );
    expect(screen.getByLabelText("Válida até")).toBeInTheDocument();
  });

  it("renders save and send buttons", () => {
    render(
      <QuoteForm
        retailerId="r1-uuid"
        retailerName="Loja Centro"
        products={mockProducts}
      />,
    );
    expect(screen.getByText("Salvar rascunho")).toBeInTheDocument();
    expect(screen.getByText("Salvar e enviar")).toBeInTheDocument();
  });

  it("renders add button", () => {
    render(
      <QuoteForm
        retailerId="r1-uuid"
        retailerName="Loja Centro"
        products={mockProducts}
      />,
    );
    expect(screen.getByText("Adicionar")).toBeInTheDocument();
  });

  it("shows initial total of R$ 0,00", () => {
    render(
      <QuoteForm
        retailerId="r1-uuid"
        retailerName="Loja Centro"
        products={mockProducts}
      />,
    );
    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
  });
});
