import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/actions/collections", () => ({
  createCollection: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { createCollection } from "@/lib/actions/collections";
import { CreateCollectionDrawer } from "@/components/domain/catalog/create-collection-drawer";

const mockCreateCollection = vi.mocked(createCollection);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CreateCollectionDrawer", () => {
  it("renders trigger element", () => {
    render(
      <CreateCollectionDrawer>
        <button>Open</button>
      </CreateCollectionDrawer>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("trigger is a button", () => {
    render(
      <CreateCollectionDrawer>
        <button>Open</button>
      </CreateCollectionDrawer>,
    );
    const trigger = screen.getByText("Open");
    expect(trigger.tagName).toBe("BUTTON");
  });

  it("trigger has dialog trigger attributes", () => {
    render(
      <CreateCollectionDrawer>
        <button>Open</button>
      </CreateCollectionDrawer>,
    );
    const trigger = screen.getByText("Open");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("trigger starts with aria-expanded=false", () => {
    render(
      <CreateCollectionDrawer>
        <button>Open</button>
      </CreateCollectionDrawer>,
    );
    const trigger = screen.getByText("Open");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
