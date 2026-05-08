import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DollarSign } from "lucide-react";

import { KpiCard } from "@/components/domain/analytics/kpi-card";

describe("KpiCard", () => {
  it("renders label and value", () => {
    render(<KpiCard label="Faturamento" value="R$ 1.234" icon={DollarSign} />);
    expect(screen.getByText("R$ 1.234")).toBeInTheDocument();
    expect(screen.getByText("Faturamento")).toBeInTheDocument();
  });

  it("renders icon with aria-hidden", () => {
    const { container } = render(
      <KpiCard label="Pedidos" value="42" icon={DollarSign} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders different values correctly", () => {
    render(<KpiCard label="Teste" value="0" icon={DollarSign} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
