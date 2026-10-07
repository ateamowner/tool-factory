export type TimeCardDayInput = {
  label: string;
  start: string;
  end: string;
  breakMinutes: string;
};

export type TimeCardDayResult = {
  label: string;
  status: "empty" | "ok" | "invalid";
  error: string | null;
  minutes: number;
  overnight: boolean;
};

export type TimeCardInput = {
  days: TimeCardDayInput[];
  hourlyRate: number | null;
  otThreshold: number;
  otMultiplier: number;
};

export type TimeCardResult = {
  valid: boolean;
  error: string | null;
  days: TimeCardDayResult[];
  totalMinutes: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number | null;
  otRate: number | null;
  regularPay: number | null;
  overtimePay: number | null;
  totalPay: number | null;
  summary: string | null;
};

export const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DEFAULT_TC_OT_THRESHOLD = 40;
export const DEFAULT_TC_OT_MULTIPLIER = 1.5;
export const MAX_TC_HOURLY_RATE = 10_000;
export const MAX_TC_MULTIPLIER = 10;
export const MAX_TC_WEEK_HOURS = 168;
const MINUTES_PER_DAY = 24 * 60;

/**
 * Parse a clock time into minutes after midnight.
 * Accepts 24-hour "HH:MM" (what <input type="time"> emits), "H:MM AM/PM",
 * "9am", "930", "1730". Returns null for empty input, NaN for invalid input.
 */
export function parseClockTime(value: string): number | null {
  const raw = value.trim().toLowerCase().replace(/\./g, "");
  if (raw === "") return null;

  const match = raw.match(/^(\d{1,2})(?::?(\d{2}))?\s*(am|pm|a|p)?$/);
  if (!match) return Number.NaN;

  let hours = Number(match[1]);
  const minutes = match[2] === undefined ? 0 : Number(match[2]);
  const meridiem = match[3];

  if (minutes > 59) return Number.NaN;

  if (meridiem) {
    if (hours < 1 || hours > 12) return Number.NaN;
    const isPm = meridiem.startsWith("p");
    if (hours === 12) hours = isPm ? 12 : 0;
    else if (isPm) hours += 12;
  } else if (hours > 23) {
    return Number.NaN;
  }

  return hours * 60 + minutes;
}

/** Strip commas. Empty input is NaN so callers can reject it. */
export function parseTimeCardNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

/** Minutes worked for one shift. End before start is treated as an overnight shift. */
export function computeDay(day: TimeCardDayInput): TimeCardDayResult {
  const base = { label: day.label, minutes: 0, overnight: false };
  const start = parseClockTime(day.start);
  const end = parseClockTime(day.end);
  const breakRaw = day.breakMinutes.trim();

  if (start === null && end === null) {
    return { ...base, status: "empty", error: null };
  }
  if (start === null || end === null) {
    return { ...base, status: "invalid", error: `${day.label}: enter both a start and an end time.` };
  }
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { ...base, status: "invalid", error: `${day.label}: use a time like 8:30 AM or 17:00.` };
  }

  const breakMinutes = breakRaw === "" ? 0 : parseTimeCardNumber(breakRaw);
  if (!Number.isFinite(breakMinutes) || breakMinutes < 0) {
    return { ...base, status: "invalid", error: `${day.label}: break minutes must be 0 or more.` };
  }

  const overnight = end < start;
  const span = overnight ? end + MINUTES_PER_DAY - start : end - start;

  if (breakMinutes > span) {
    return { ...base, status: "invalid", error: `${day.label}: break is longer than the shift.` };
  }

  return {
    label: day.label,
    status: "ok",
    error: null,
    minutes: span - breakMinutes,
    overnight,
  };
}

export function formatHoursMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

export function formatDecimalHours(totalMinutes: number): string {
  return (totalMinutes / 60).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatTimeCardUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function invalid(error: string, days: TimeCardDayResult[]): TimeCardResult {
  return {
    valid: false,
    error,
    days,
    totalMinutes: 0,
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    hourlyRate: null,
    otRate: null,
    regularPay: null,
    overtimePay: null,
    totalPay: null,
    summary: null,
  };
}

/**
 * Weekly time card total.
 * Each day: (end − start, wrapping past midnight) − unpaid break.
 * Weekly hours above the threshold (default 40) are overtime.
 * Pay is optional: regular hours × rate + OT hours × rate × multiplier.
 */
export function computeTimeCard(input: TimeCardInput): TimeCardResult {
  const days = input.days.map(computeDay);
  const firstError = days.find((day) => day.status === "invalid");
  if (firstError) return invalid(firstError.error ?? "Check your times.", days);

  if (!days.some((day) => day.status === "ok")) {
    return invalid("Enter a start and end time for at least one day.", days);
  }

  if (
    !Number.isFinite(input.otThreshold) ||
    input.otThreshold < 0 ||
    input.otThreshold > MAX_TC_WEEK_HOURS
  ) {
    return invalid(`Enter an overtime threshold from 0 to ${MAX_TC_WEEK_HOURS} hours.`, days);
  }
  if (
    !Number.isFinite(input.otMultiplier) ||
    input.otMultiplier < 1 ||
    input.otMultiplier > MAX_TC_MULTIPLIER
  ) {
    return invalid(`Enter an overtime multiplier from 1 to ${MAX_TC_MULTIPLIER}.`, days);
  }

  const rate = input.hourlyRate;
  if (rate !== null && (!Number.isFinite(rate) || rate <= 0 || rate > MAX_TC_HOURLY_RATE)) {
    return invalid(
      `Enter an hourly rate greater than 0 and up to ${MAX_TC_HOURLY_RATE.toLocaleString("en-US")}, or leave it blank.`,
      days,
    );
  }

  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);
  const totalHours = totalMinutes / 60;
  const regularHours = Math.min(totalHours, input.otThreshold);
  const overtimeHours = Math.max(0, totalHours - input.otThreshold);

  let otRate: number | null = null;
  let regularPay: number | null = null;
  let overtimePay: number | null = null;
  let totalPay: number | null = null;
  if (rate !== null) {
    otRate = rate * input.otMultiplier;
    regularPay = rate * regularHours;
    overtimePay = otRate * overtimeHours;
    totalPay = regularPay + overtimePay;
  }

  const workedDays = days.filter((day) => day.status === "ok").length;
  let summary = `${formatHoursMinutes(totalMinutes)} (${formatDecimalHours(totalMinutes)} hours) across ${workedDays} ${workedDays === 1 ? "day" : "days"}`;
  if (overtimeHours > 0) {
    summary += `, including ${formatDecimalHours(overtimeHours * 60)} overtime hours`;
  }
  if (totalPay !== null) {
    summary += ` = ${formatTimeCardUsd(totalPay)} gross`;
  }
  summary += ".";

  return {
    valid: true,
    error: null,
    days,
    totalMinutes,
    totalHours,
    regularHours,
    overtimeHours,
    hourlyRate: rate,
    otRate,
    regularPay,
    overtimePay,
    totalPay,
    summary,
  };
}
