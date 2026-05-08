import { describe, it, expect } from "vitest";
import {
  conversationIdSchema,
  messageIdSchema,
  getOrCreateConversationSchema,
  sendMessageSchema,
  searchMessagesSchema,
} from "@/lib/validators/conversations";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000";

describe("conversationIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(conversationIdSchema.safeParse(VALID_UUID).success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(conversationIdSchema.safeParse("abc").success).toBe(false);
  });
});

describe("getOrCreateConversationSchema", () => {
  it("accepts valid input with defaults", () => {
    const result = getOrCreateConversationSchema.safeParse({
      factory_id: VALID_UUID,
      retailer_id: VALID_UUID_2,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.context_type).toBe("general");
  });

  it("accepts explicit context_type and context_id", () => {
    const result = getOrCreateConversationSchema.safeParse({
      factory_id: VALID_UUID,
      retailer_id: VALID_UUID_2,
      context_type: "quote",
      context_id: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid factory_id", () => {
    const result = getOrCreateConversationSchema.safeParse({
      factory_id: "not-uuid",
      retailer_id: VALID_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid context_type", () => {
    const result = getOrCreateConversationSchema.safeParse({
      factory_id: VALID_UUID,
      retailer_id: VALID_UUID_2,
      context_type: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("sendMessageSchema", () => {
  it("accepts valid message", () => {
    const result = sendMessageSchema.safeParse({
      conversation_id: VALID_UUID,
      body: "Olá, tudo bem?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty body", () => {
    const result = sendMessageSchema.safeParse({
      conversation_id: VALID_UUID,
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects body longer than 5000 chars", () => {
    const result = sendMessageSchema.safeParse({
      conversation_id: VALID_UUID,
      body: "A".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional attachment_ids", () => {
    const result = sendMessageSchema.safeParse({
      conversation_id: VALID_UUID,
      body: "Com anexos",
      attachment_ids: [VALID_UUID, VALID_UUID_2],
    });
    expect(result.success).toBe(true);
  });
});

describe("searchMessagesSchema", () => {
  it("accepts valid search query", () => {
    const result = searchMessagesSchema.safeParse({ query: "preço" });
    expect(result.success).toBe(true);
  });

  it("rejects query shorter than 2 chars", () => {
    const result = searchMessagesSchema.safeParse({ query: "a" });
    expect(result.success).toBe(false);
  });

  it("rejects query longer than 200 chars", () => {
    const result = searchMessagesSchema.safeParse({
      query: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
