import { describe, it, expect } from "vitest";
import {
  attachmentIdSchema,
  uploadAttachmentSchema,
  MAX_FILE_SIZE,
} from "@/lib/validators/message-attachments";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("attachmentIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(attachmentIdSchema.safeParse(VALID_UUID).success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(attachmentIdSchema.safeParse("xyz").success).toBe(false);
  });
});

describe("uploadAttachmentSchema", () => {
  it("accepts valid image upload", () => {
    const result = uploadAttachmentSchema.safeParse({
      file_name: "photo.jpg",
      file_type: "image/jpeg",
      file_size: 1024 * 1024,
      conversation_id: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid PDF upload", () => {
    const result = uploadAttachmentSchema.safeParse({
      file_name: "document.pdf",
      file_type: "application/pdf",
      file_size: 5 * 1024 * 1024,
      conversation_id: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported file type", () => {
    const result = uploadAttachmentSchema.safeParse({
      file_name: "video.mp4",
      file_type: "video/mp4",
      file_size: 1024,
      conversation_id: VALID_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects file exceeding max size", () => {
    const result = uploadAttachmentSchema.safeParse({
      file_name: "big.jpg",
      file_type: "image/jpeg",
      file_size: MAX_FILE_SIZE + 1,
      conversation_id: VALID_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty file name", () => {
    const result = uploadAttachmentSchema.safeParse({
      file_name: "",
      file_type: "image/png",
      file_size: 1024,
      conversation_id: VALID_UUID,
    });
    expect(result.success).toBe(false);
  });
});
