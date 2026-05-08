import { z } from "zod";

export const dateRangeSchema = z.object({
  startDate: z.string().date("Data de início inválida"),
  endDate: z.string().date("Data de fim inválida"),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;

const PERIOD_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
} as const;

export type PeriodKey = keyof typeof PERIOD_DAYS;

export const periodSchema = z.enum(["7d", "30d", "90d", "12m"]).default("30d");

export function periodToDates(period: PeriodKey): {
  startDate: string;
  endDate: string;
} {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - PERIOD_DAYS[period]);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
