import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/actions/favorites", () => ({
  toggleFavoriteFactory: vi
    .fn()
    .mockResolvedValue({ success: true, data: { favorited: true } }),
  toggleFavoriteProduct: vi
    .fn()
    .mockResolvedValue({ success: true, data: { favorited: true } }),
}));

import { FavoriteButton } from "@/components/domain/discover/favorite-button";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FavoriteButton", () => {
  it("renders unfavorited state", () => {
    render(<FavoriteButton targetId="f1" type="factory" isFavorited={false} />);
    expect(
      screen.getByRole("button", { name: "Adicionar aos favoritos" }),
    ).toBeInTheDocument();
  });

  it("renders favorited state", () => {
    render(<FavoriteButton targetId="f1" type="factory" isFavorited={true} />);
    expect(
      screen.getByRole("button", { name: "Remover dos favoritos" }),
    ).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton targetId="f1" type="factory" isFavorited={false} />);

    const button = screen.getByRole("button", {
      name: "Adicionar aos favoritos",
    });
    await user.click(button);

    const { toggleFavoriteFactory } = await import("@/lib/actions/favorites");
    expect(toggleFavoriteFactory).toHaveBeenCalledWith("f1");
  });

  it("uses product action when type is product", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton targetId="p1" type="product" isFavorited={false} />);

    const button = screen.getByRole("button", {
      name: "Adicionar aos favoritos",
    });
    await user.click(button);

    const { toggleFavoriteProduct } = await import("@/lib/actions/favorites");
    expect(toggleFavoriteProduct).toHaveBeenCalledWith("p1");
  });
});
