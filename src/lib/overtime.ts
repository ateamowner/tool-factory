export type OvertimeMode = "split" | "total";

export type OvertimeInput = {
  mode: OvertimeMode;
  hourlyRate: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  otThreshold: number;
  otMultiplier: number;
};

export type OvertimeStatus = "ok" | "invalid";

export type OvertimeResult = {
  status: OvertimeStatus;
  valid: boolean;
  error: string | null;
  mode: OvertimeMode | null;
  hourlyRate: number | null;
  otMultiplier: number | null;
  otRate: number | null;
  otThreshold: number | null;
  regularHours: number | null;
  overtimeHours: number | null;
  totalHours: number | null;
  regularPay: number | null;
  overtimePay: number | null;
  totalPay: number | null;
  biweeklyPay: number | null;
  summary: string | null;
};

export const DEFAULT_OT_THRESHOLD = 40;
export const DEFAULT_OT_MULTIPLIER = 1.5;
export const MAX_HOURLY_RATE = 10_000;
export const MAX_HOURS = 168;
export const MAX_MULTIPLIER = 10;

const emptyResult = (error: string): OvertimeResult => ({
  status: "invalid",
  valid: false,
  error,
  mode: null,
  hourlyRate: null,
  otMultiplier: null,
  otRate: null,
  otThreshold: null,
  regularHours: null,
  overtimeHours: null,
  totalHours: null,
  regularPay: null,
  overtimePay: null,
  totalPay: null,
  biweeklyPay: null,
  summary: null,
});

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

/** Strip thousands separators. Empty input is NaN so callers can reject it. */
export function parseOvertimeNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatHours(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

export function formatMultiplier(value: number): string {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })}×`;
}

export function splitFromTotal(
  totalHours: number,
  otThreshold: number,
): { regularHours: number; overtimeHours: number } {
  const threshold = Math.max(0, otThreshold);
  const regularHours = Math.min(totalHours, threshold);
  const overtimeHours = Math.max(0, totalHours - threshold);
  return { regularHours, overtimeHours };
}

export function formatOvertimeSummary(input: {
  hourlyRate: number;
  otMultiplier: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
}): string {
  const rate = formatUsd(input.hourlyRate);
  const otRate = formatUsd(input.hourlyRate * input.otMultiplier);
  if (input.overtimeHours === 0) {
    return `${formatHours(input.regularHours)} regular hours at ${rate}/hr = ${formatUsd(input.totalPay)} total (no overtime).`;
  }
  return `${formatHours(input.regularHours)} regular hours at ${rate}/hr (${formatUsd(input.regularPay)}) plus ${formatHours(input.overtimeHours)} OT hours at ${otRate}/hr (${formatMultiplier(input.otMultiplier)}, ${formatUsd(input.overtimePay)}) = ${formatUsd(input.totalPay)} total.`;
}

/**
 * Gross overtime pay estimate.
 * Regular pay = hourly rate × regular hours.
 * OT pay = hourly rate × multiplier × OT hours (default 1.5× after a 40-hour threshold).
 */
export function computeOvertime(input: OvertimeInput): OvertimeResult {
  if (input.mode !== "split" && input.mode !== "total") {
    return emptyResult("Choose how to enter hours.");
  }

  if (
    !isFiniteNumber(input.hourlyRate) ||
    input.hourlyRate <= 0 ||
    input.hourlyRate > MAX_HOURLY_RATE
  ) {
    return emptyResult(`Enter an hourly rate greater than 0 and up to ${MAX_HOURLY_RATE.toLocaleString("en-US")}.`);
  }

  if (
    !isFiniteNumber(input.otMultiplier) ||
    input.otMultiplier < 1 ||
    input.otMultiplier > MAX_MULTIPLIER
  ) {
    return emptyResult(`Enter an overtime multiplier from 1 to ${MAX_MULTIPLIER}.`);
  }

  let regularHours: number;
  let overtimeHours: number;
  let otThreshold: number | null = null;

  if (input.mode === "split") {
    if (
      !isFiniteNumber(input.regularHours) ||
      input.regularHours < 0 ||
      input.regularHours > MAX_HOURS
    ) {
      return emptyResult(`Enter regular hours from 0 to ${MAX_HOURS}.`);
    }
    if (
      !isFiniteNumber(input.overtimeHours) ||
      input.overtimeHours < 0 ||
      input.overtimeHours > MAX_HOURS
    ) {
      return emptyResult(`Enter overtime hours from 0 to ${MAX_HOURS}.`);
    }
    if (input.regularHours === 0 && input.overtimeHours === 0) {
      return emptyResult("Enter regular hours, overtime hours, or both greater than 0.");
    }
    if (input.regularHours + input.overtimeHours > MAX_HOURS) {
      return emptyResult(`Total hours in a week cannot exceed ${MAX_HOURS}.`);
    }
    regularHours = input.regularHours;
    overtimeHours = input.overtimeHours;
  } else {
    if (
      !isFiniteNumber(input.otThreshold) ||
      input.otThreshold < 0 ||
      input.otThreshold > MAX_HOURS
    ) {
      return emptyResult(`Enter an overtime threshold from 0 to ${MAX_HOURS} hours.`);
    }
    if (
      !isFiniteNumber(input.totalHours) ||
      input.totalHours <= 0 ||
      input.totalHours > MAX_HOURS
    ) {
      return emptyResult(`Enter total hours greater than 0 and up to ${MAX_HOURS}.`);
    }
    otThreshold = input.otThreshold;
    const split = splitFromTotal(input.totalHours, input.otThreshold);
    regularHours = split.regularHours;
    overtimeHours = split.overtimeHours;
  }

  const totalHours = regularHours + overtimeHours;
  const otRate = input.hourlyRate * input.otMultiplier;
  const regularPay = input.hourlyRate * regularHours;
  const overtimePay = otRate * overtimeHours;
  const totalPay = regularPay + overtimePay;
  const biweeklyPay = totalPay * 2;
  const summary = formatOvertimeSummary({
    hourlyRate: input.hourlyRate,
    otMultiplier: input.otMultiplier,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay,
  });

  return {
    status: "ok",
    valid: true,
    error: null,
    mode: input.mode,
    hourlyRate: input.hourlyRate,
    otMultiplier: input.otMultiplier,
    otRate,
    otThreshold,
    regularHours,
    overtimeHours,
    totalHours,
    regularPay,
    overtimePay,
    totalPay,
    biweeklyPay,
    summary,
  };
}
