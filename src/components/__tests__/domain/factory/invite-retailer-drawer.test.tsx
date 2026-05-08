import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/actions/factory-invitations", () => ({
  sendFactoryInvitation: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { InviteRetailerDrawer } from "@/components/domain/factory/invite-retailer-drawer";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("InviteRetailerDrawer", () => {
  it("renders trigger element", () => {
    render(
      <InviteRetailerDrawer>
        <button>Convidar</button>
      </InviteRetailerDrawer>,
    );
    expect(screen.getByText("Convidar")).toBeInTheDocument();
  });

  it("trigger is a button with dialog attributes", () => {
    render(
      <InviteRetailerDrawer>
        <button>Convidar</button>
      </InviteRetailerDrawer>,
    );
    const trigger = screen.getByText("Convidar");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("trigger starts with aria-expanded=false", () => {
    render(
      <InviteRetailerDrawer>
        <button>Convidar</button>
      </InviteRetailerDrawer>,
    );
    const trigger = screen.getByText("Convidar");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("accepts children as ReactNode", () => {
    render(
      <InviteRetailerDrawer>
        <button>
          <span>Inner text</span>
        </button>
      </InviteRetailerDrawer>,
    );
    expect(screen.getByText("Inner text")).toBeInTheDocument();
  });
});
