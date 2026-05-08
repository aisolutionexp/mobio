import { describe, it, expect } from "vitest";
import {
  dateRangeSchema,
  periodSchema,
  periodToDates,
} from "@/lib/validators/analytics";

describe("dateRangeSchema", () => {
  it("accepts valid date range", () => {
    const result = dateRangeSchema.safeParse({
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid startDate", () => {
    const result = dateRangeSchema.safeParse({
      startDate: "not-a-date",
      endDate: "2025-01-31",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing endDate", () => {
    const result = dateRangeSchema.safeParse({
      startDate: "2025-01-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("periodSchema", () => {
  it("accepts valid period keys", () => {
    for (const key of ["7d", "30d", "90d", "12m"]) {
      expect(periodSchema.safeParse(key).success).toBe(true);
    }
  });

  it("rejects invalid period", () => {
    expect(periodSchema.safeParse("1y").success).toBe(false);
  });

  it("defaults to 30d when undefined", () => {
    const result = periodSchema.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("30d");
  });
});

describe("periodToDates", () => {
  it("returns startDate before endDate for 7d", () => {
    const { startDate, endDate } = periodToDates("7d");
    expect(new Date(startDate) < new Date(endDate)).toBe(true);
  });

  it("returns ISO date strings", () => {
    const { startDate, endDate } = periodToDates("30d");
    expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
