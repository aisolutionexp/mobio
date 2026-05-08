import { describe, it, expect } from "vitest";
import {
  createShowroomSchema,
  updateShowroomSchema,
  createSlotSchema,
  updateSlotSchema,
  bookSlotSchema,
  showroomIdSchema,
  slotIdSchema,
  bookingIdSchema,
} from "@/lib/validators/showrooms";

describe("showroomIdSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      showroomIdSchema.safeParse("550e8400-e29b-41d4-a716-446655440000")
        .success,
    ).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(showroomIdSchema.safeParse("not-uuid").success).toBe(false);
  });
});

describe("createShowroomSchema", () => {
  it("accepts valid input", () => {
    const result = createShowroomSchema.safeParse({
      name: "Showroom Verão 2027",
      type: "physical",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = createShowroomSchema.safeParse({
      name: "Showroom Virtual",
      type: "virtual",
      description: "Sala de apresentação online",
      event_date: "2027-06-15T10:00:00-03:00",
      location: "São Paulo, SP",
      capacity: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createShowroomSchema.safeParse({
      name: "",
      type: "physical",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 100 chars", () => {
    const result = createShowroomSchema.safeParse({
      name: "A".repeat(101),
      type: "physical",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = createShowroomSchema.safeParse({
      name: "Test",
      type: "hybrid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative capacity", () => {
    const result = createShowroomSchema.safeParse({
      name: "Test",
      type: "physical",
      capacity: -5,
    });
    expect(result.success).toBe(false);
  });

  it("coerces capacity string to number", () => {
    const result = createShowroomSchema.safeParse({
      name: "Test",
      type: "physical",
      capacity: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.capacity).toBe(25);
  });

  it("rejects description longer than 500 chars", () => {
    const result = createShowroomSchema.safeParse({
      name: "Test",
      type: "physical",
      description: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateShowroomSchema", () => {
  it("accepts partial update", () => {
    const result = updateShowroomSchema.safeParse({ name: "Novo nome" });
    expect(result.success).toBe(true);
  });

  it("accepts status update", () => {
    const result = updateShowroomSchema.safeParse({ status: "published" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateShowroomSchema.safeParse({ status: "archived" });
    expect(result.success).toBe(false);
  });

  it("accepts nullable fields", () => {
    const result = updateShowroomSchema.safeParse({
      description: null,
      location: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("createSlotSchema", () => {
  it("accepts valid slot", () => {
    const result = createSlotSchema.safeParse({
      starts_at: "2027-06-15T10:00:00-03:00",
      ends_at: "2027-06-15T12:00:00-03:00",
      max_attendees: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects ends_at before starts_at", () => {
    const result = createSlotSchema.safeParse({
      starts_at: "2027-06-15T12:00:00-03:00",
      ends_at: "2027-06-15T10:00:00-03:00",
    });
    expect(result.success).toBe(false);
  });

  it("defaults max_attendees to 1", () => {
    const result = createSlotSchema.safeParse({
      starts_at: "2027-06-15T10:00:00-03:00",
      ends_at: "2027-06-15T12:00:00-03:00",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.max_attendees).toBe(1);
  });

  it("rejects location_details longer than 300 chars", () => {
    const result = createSlotSchema.safeParse({
      starts_at: "2027-06-15T10:00:00-03:00",
      ends_at: "2027-06-15T12:00:00-03:00",
      location_details: "A".repeat(301),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateSlotSchema", () => {
  it("accepts partial update", () => {
    const result = updateSlotSchema.safeParse({ max_attendees: 10 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid time range when both provided", () => {
    const result = updateSlotSchema.safeParse({
      starts_at: "2027-06-15T14:00:00-03:00",
      ends_at: "2027-06-15T10:00:00-03:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("bookSlotSchema", () => {
  it("accepts valid notes", () => {
    const result = bookSlotSchema.safeParse({
      notes: "Gostaria de ver coleção A",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = bookSlotSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects notes longer than 300 chars", () => {
    const result = bookSlotSchema.safeParse({ notes: "A".repeat(301) });
    expect(result.success).toBe(false);
  });
});
