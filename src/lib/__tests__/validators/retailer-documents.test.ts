import { describe, it, expect } from "vitest";
import {
  documentIdSchema,
  uploadRetailerDocumentSchema,
  MAX_FILE_SIZE,
} from "@/lib/validators/retailer-documents";

describe("documentIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      documentIdSchema.safeParse("550e8400-e29b-41d4-a716-446655440000")
        .success,
    ).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(documentIdSchema.safeParse("abc").success).toBe(false);
  });
});

describe("uploadRetailerDocumentSchema", () => {
  it("accepts valid PDF upload", () => {
    const result = uploadRetailerDocumentSchema.safeParse({
      doc_type: "cnpj_card",
      file_name: "cnpj.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024,
    });
    expect(result.success).toBe(true);
  });

  it("accepts JPEG upload", () => {
    const result = uploadRetailerDocumentSchema.safeParse({
      doc_type: "contrato_social",
      file_name: "contrato.jpg",
      file_type: "image/jpeg",
      file_size: 2 * 1024 * 1024,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported file type", () => {
    const result = uploadRetailerDocumentSchema.safeParse({
      doc_type: "cnpj_card",
      file_name: "document.docx",
      file_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      file_size: 1024,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid doc_type", () => {
    const result = uploadRetailerDocumentSchema.safeParse({
      doc_type: "passport",
      file_name: "file.pdf",
      file_type: "application/pdf",
      file_size: 1024,
    });
    expect(result.success).toBe(false);
  });

  it("rejects file exceeding 10MB", () => {
    const result = uploadRetailerDocumentSchema.safeParse({
      doc_type: "outros",
      file_name: "big.pdf",
      file_type: "application/pdf",
      file_size: MAX_FILE_SIZE + 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty file name", () => {
    const result = uploadRetailerDocumentSchema.safeParse({
      doc_type: "cnpj_card",
      file_name: "",
      file_type: "application/pdf",
      file_size: 1024,
    });
    expect(result.success).toBe(false);
  });
});
