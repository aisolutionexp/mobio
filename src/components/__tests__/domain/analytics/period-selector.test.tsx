import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

import { PeriodSelector } from "@/components/domain/analytics/period-selector";

describe("PeriodSelector", () => {
  it("renders all period buttons", () => {
    render(<PeriodSelector basePath="/test" />);
    expect(screen.getByText("7 dias")).toBeInTheDocument();
    expect(screen.getByText("30 dias")).toBeInTheDocument();
    expect(screen.getByText("90 dias")).toBeInTheDocument();
    expect(screen.getByText("12 meses")).toBeInTheDocument();
  });

  it("navigates with period param when selecting non-default", () => {
    render(<PeriodSelector basePath="/test" />);
    fireEvent.click(screen.getByText("7 dias"));
    expect(mockPush).toHaveBeenCalledWith("/test?period=7d");
  });

  it("navigates without period param for 30d (default)", () => {
    render(<PeriodSelector basePath="/test" />);
    fireEvent.click(screen.getByText("30 dias"));
    expect(mockPush).toHaveBeenCalledWith("/test");
  });
});
