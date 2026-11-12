import { parseIsoDate } from "./date-calc.ts";

export type ProrateMode = "move-in" | "move-out";
export type ProrateMethod = "actual" | "thirty" | "year365";

export type ProrateLine = {
  method: ProrateMethod;
  label: string;
  dailyRate: number;
  days: number;
  amount: number;
};

export type ProrateResult =
  | { valid: false; error: string }
  | {
      valid: true;
      mode: ProrateMode;
      daysInMonth: number;
      daysCharged: number;
      lines: ProrateLine[];
    };

export const METHOD_LABELS: Record<ProrateMethod, string> = {
  actual: "Actual days in the month",
  thirty: "30-day month",
  year365: "365 days a year",
};

export function daysInMonthOf(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function roundCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeProratedRent(monthlyRent: number, isoDate: string, mode: ProrateMode): ProrateResult {
  if (!Number.isFinite(monthlyRent) || monthlyRent <= 0) {
    return { valid: false, error: "Enter a monthly rent greater than 0." };
  }
  const p = parseIsoDate(isoDate);
  if (!p) return { valid: false, error: "Enter a valid date." };
  const dim = daysInMonthOf(p.y, p.m);
  const daysCharged = mode === "move-in" ? dim - p.d + 1 : p.d;

  const actualRate = monthlyRent / dim;
  const thirtyRate = monthlyRent / 30;
  const yearRate = (monthlyRent * 12) / 365;
  // A 30-day month never charges more than one full month of rent.
  const thirtyDays = Math.min(daysCharged, 30);

  const lines: ProrateLine[] = [
    { method: "actual", label: METHOD_LABELS.actual, dailyRate: actualRate, days: daysCharged, amount: roundCents(actualRate * daysCharged) },
    { method: "thirty", label: METHOD_LABELS.thirty, dailyRate: thirtyRate, days: thirtyDays, amount: roundCents(thirtyRate * thirtyDays) },
    { method: "year365", label: METHOD_LABELS.year365, dailyRate: yearRate, days: daysCharged, amount: roundCents(yearRate * daysCharged) },
  ];
  return { valid: true, mode, daysInMonth: dim, daysCharged, lines };
}
