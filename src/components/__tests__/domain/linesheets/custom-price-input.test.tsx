import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/actions/linesheets", () => ({
  updateLinesheetItemCustomPrice: vi
    .fn()
    .mockResolvedValue({ success: true, data: undefined }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { CustomPriceInput } from "@/components/domain/linesheets/custom-price-input";

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

describe("CustomPriceInput", () => {
  it("renders with initial price", () => {
    render(<CustomPriceInput itemId="item-1" initialPrice={250} />);
    const input = screen.getByLabelText("Preço customizado");
    expect(input).toHaveValue("250");
  });

  it("renders empty when no initial price", () => {
    render(<CustomPriceInput itemId="item-1" initialPrice={null} />);
    const input = screen.getByLabelText("Preço customizado");
    expect(input).toHaveValue("");
  });

  it("shows R$ prefix", () => {
    render(<CustomPriceInput itemId="item-1" initialPrice={null} />);
    expect(screen.getByText("R$")).toBeInTheDocument();
  });

  it("strips non-numeric characters except dot", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<CustomPriceInput itemId="item-1" initialPrice={null} />);
    const input = screen.getByLabelText("Preço customizado");

    await user.clear(input);
    await user.type(input, "abc123.45xyz");

    expect(input).toHaveValue("123.45");
  });

  it("calls save action on blur", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<CustomPriceInput itemId="item-1" initialPrice={null} />);
    const input = screen.getByLabelText("Preço customizado");

    await user.type(input, "199.90");
    await user.tab();

    const { updateLinesheetItemCustomPrice } =
      await import("@/lib/actions/linesheets");
    expect(updateLinesheetItemCustomPrice).toHaveBeenCalledWith(
      "item-1",
      199.9,
    );
  });

  it("does not save invalid values on blur", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<CustomPriceInput itemId="item-1" initialPrice={null} />);
    const input = screen.getByLabelText("Preço customizado");

    await user.type(input, "abc");
    await user.tab();

    const { updateLinesheetItemCustomPrice } =
      await import("@/lib/actions/linesheets");
    expect(updateLinesheetItemCustomPrice).not.toHaveBeenCalled();
  });
});
