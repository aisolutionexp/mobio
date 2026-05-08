import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/actions/boards", () => ({
  createBoard: vi
    .fn()
    .mockResolvedValue({ success: true, data: { id: "new-id" } }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { CreateBoardDrawer } from "@/components/domain/boards/create-board-drawer";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CreateBoardDrawer", () => {
  it("renders trigger button", () => {
    render(
      <CreateBoardDrawer>
        <button>Novo board</button>
      </CreateBoardDrawer>,
    );
    expect(screen.getByText("Novo board")).toBeInTheDocument();
  });

  it("opens drawer on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <CreateBoardDrawer>
        <button>Novo board</button>
      </CreateBoardDrawer>,
    );

    await user.click(screen.getByText("Novo board"));
    expect(screen.getByText("Nome do board")).toBeInTheDocument();
  });

  it("shows error toast on failure", async () => {
    const { createBoard } = await import("@/lib/actions/boards");
    vi.mocked(createBoard).mockResolvedValueOnce({
      success: false,
      error: "Nome inválido",
    });

    const user = userEvent.setup();
    render(
      <CreateBoardDrawer>
        <button>Novo board</button>
      </CreateBoardDrawer>,
    );

    await user.click(screen.getByText("Novo board"));

    const nameInput = screen.getByPlaceholderText("Ex: Seleção inverno 2027");
    await user.type(nameInput, "Test");

    const submitButton = screen.getByText("Criar board");
    await user.click(submitButton);

    const { toast } = await import("sonner");
    expect(toast.error).toHaveBeenCalledWith("Nome inválido");
  });
});
