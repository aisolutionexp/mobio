import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/actions/message-attachments", () => ({
  getAttachmentUrl: vi
    .fn()
    .mockResolvedValue({
      success: true,
      data: { url: "https://test.com/file" },
    }),
}));

import { MessageBubble } from "@/components/domain/messaging/message-bubble";

const BASE_PROPS = {
  body: "Olá, tudo bem?",
  senderName: "Maria Silva",
  senderAvatar: null,
  timestamp: "2027-06-15T10:30:00-03:00",
  isMine: false,
};

describe("MessageBubble", () => {
  it("renders message body", () => {
    render(<MessageBubble {...BASE_PROPS} />);
    expect(screen.getByText("Olá, tudo bem?")).toBeInTheDocument();
  });

  it("renders sender name", () => {
    render(<MessageBubble {...BASE_PROPS} />);
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
  });

  it("renders sender initials in avatar", () => {
    render(<MessageBubble {...BASE_PROPS} />);
    expect(screen.getByText("MS")).toBeInTheDocument();
  });

  it("renders formatted timestamp", () => {
    render(<MessageBubble {...BASE_PROPS} />);
    const timestamp = screen.getByText(/15\/06/);
    expect(timestamp).toBeInTheDocument();
  });

  it("renders attachments when provided", () => {
    const attachments = [
      {
        id: "att-1",
        file_name: "documento.pdf",
        file_type: "application/pdf",
        file_size_bytes: 1024,
        storage_path: "conv/doc.pdf",
      },
    ];
    render(<MessageBubble {...BASE_PROPS} attachments={attachments} />);
    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
  });

  it("applies highlight ring when highlighted", () => {
    const { container } = render(<MessageBubble {...BASE_PROPS} highlighted />);
    const bubble = container.querySelector(".ring-2");
    expect(bubble).toBeInTheDocument();
  });
});
