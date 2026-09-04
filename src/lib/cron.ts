export type CronFields = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

export type CronFieldName = keyof CronFields;

export type CronPresetId =
  | "every-minute"
  | "every-5-minutes"
  | "every-15-minutes"
  | "hourly"
  | "every-6-hours"
  | "daily-midnight"
  | "daily-noon"
  | "weekdays-9am"
  | "weekly-sunday-midnight"
  | "monthly-1st";

export type CronParseSuccess = {
  ok: true;
  fields: CronFields;
  expression: string;
  allowed: {
    minute: number[];
    hour: number[];
    dayOfMonth: number[];
    month: number[];
    dayOfWeek: number[];
  };
  wildcard: {
    dayOfMonth: boolean;
    dayOfWeek: boolean;
  };
};

export type CronParseFailure = {
  ok: false;
  error: string;
};

export type CronParseResult = CronParseSuccess | CronParseFailure;

type FieldSpec = {
  min: number;
  max: number;
  names: Record<string, number>;
};

const MONTH_NAMES: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const DOW_NAMES: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const FIELD_SPECS: Record<CronFieldName, FieldSpec> = {
  minute: { min: 0, max: 59, names: {} },
  hour: { min: 0, max: 23, names: {} },
  dayOfMonth: { min: 1, max: 31, names: {} },
  month: { min: 1, max: 12, names: MONTH_NAMES },
  dayOfWeek: { min: 0, max: 7, names: DOW_NAMES },
};

const FIELD_LABELS: Record<CronFieldName, string> = {
  minute: "minute",
  hour: "hour",
  dayOfMonth: "day-of-month",
  month: "month",
  dayOfWeek: "day-of-week",
};

const MONTH_WORDS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW_WORDS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const CRON_PRESETS: Record<
  CronPresetId,
  { id: CronPresetId; label: string; fields: CronFields }
> = {
  "every-minute": {
    id: "every-minute",
    label: "Every minute",
    fields: { minute: "*", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" },
  },
  "every-5-minutes": {
    id: "every-5-minutes",
    label: "Every 5 minutes",
    fields: { minute: "*/5", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" },
  },
  "every-15-minutes": {
    id: "every-15-minutes",
    label: "Every 15 minutes",
    fields: { minute: "*/15", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" },
  },
  hourly: {
    id: "hourly",
    label: "Hourly",
    fields: { minute: "0", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" },
  },
  "every-6-hours": {
    id: "every-6-hours",
    label: "Every 6 hours",
    fields: { minute: "0", hour: "*/6", dayOfMonth: "*", month: "*", dayOfWeek: "*" },
  },
  "daily-midnight": {
    id: "daily-midnight",
    label: "Daily at midnight",
    fields: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "*" },
  },
  "daily-noon": {
    id: "daily-noon",
    label: "Daily at noon",
    fields: { minute: "0", hour: "12", dayOfMonth: "*", month: "*", dayOfWeek: "*" },
  },
  "weekdays-9am": {
    id: "weekdays-9am",
    label: "Weekdays 9am",
    fields: { minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1-5" },
  },
  "weekly-sunday-midnight": {
    id: "weekly-sunday-midnight",
    label: "Weekly Sunday midnight",
    fields: { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "0" },
  },
  "monthly-1st": {
    id: "monthly-1st",
    label: "Monthly 1st",
    fields: { minute: "0", hour: "0", dayOfMonth: "1", month: "*", dayOfWeek: "*" },
  },
};

export const DEFAULT_CRON_FIELDS: CronFields = CRON_PRESETS["daily-midnight"].fields;

function isWildcardField(raw: string): boolean {
  const value = raw.trim();
  return value === "*" || value === "?";
}

function parseToken(raw: string, spec: FieldSpec, label: string): number {
  const token = raw.trim().toLowerCase();
  if (!token) {
    throw new Error(`Empty value in ${label} field`);
  }
  if (spec.names[token] !== undefined) {
    return spec.names[token];
  }
  if (!/^\d+$/.test(token)) {
    throw new Error(`Invalid ${label} value "${raw.trim()}"`);
  }
  return Number(token);
}

function normalizeDow(value: number): number {
  return value === 7 ? 0 : value;
}

function expandPart(part: string, spec: FieldSpec, label: string): number[] {
  const trimmed = part.trim();
  if (!trimmed) {
    throw new Error(`Empty value in ${label} field`);
  }

  const [rangePart, stepPart, extra] = trimmed.split("/");
  if (extra !== undefined || !rangePart) {
    throw new Error(`Invalid ${label} value "${trimmed}"`);
  }

  let step = 1;
  if (stepPart !== undefined) {
    if (!/^\d+$/.test(stepPart) || Number(stepPart) < 1) {
      throw new Error(`Invalid step in ${label} field`);
    }
    step = Number(stepPart);
  }

  let start: number;
  let end: number;
  if (isWildcardField(rangePart)) {
    start = spec.min;
    end = spec.max;
  } else if (rangePart.includes("-")) {
    const bits = rangePart.split("-");
    if (bits.length !== 2) {
      throw new Error(`Invalid ${label} range "${trimmed}"`);
    }
    start = parseToken(bits[0], spec, label);
    end = parseToken(bits[1], spec, label);
  } else {
    start = parseToken(rangePart, spec, label);
    end = start;
  }

  if (start > end) {
    throw new Error(`Invalid ${label} range "${trimmed}"`);
  }
  if (start < spec.min || end > spec.max) {
    throw new Error(`${label} must be ${spec.min}–${spec.max}`);
  }

  const values: number[] = [];
  for (let value = start; value <= end; value += step) {
    values.push(label === "day-of-week" ? normalizeDow(value) : value);
  }
  if (values.length === 0) {
    throw new Error(`Invalid ${label} value "${trimmed}"`);
  }
  return values;
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

export function expandCronField(raw: string, field: CronFieldName): number[] {
  const spec = FIELD_SPECS[field];
  const label = FIELD_LABELS[field];
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(`Enter a ${label} field`);
  }

  const values: number[] = [];
  for (const part of trimmed.split(",")) {
    values.push(...expandPart(part, spec, label));
  }
  return uniqueSorted(values);
}

export function buildCronExpression(fields: CronFields): string {
  return [
    fields.minute.trim(),
    fields.hour.trim(),
    fields.dayOfMonth.trim(),
    fields.month.trim(),
    fields.dayOfWeek.trim(),
  ].join(" ");
}

export function parseCronExpression(raw: string): CronParseResult {
  const expression = raw.trim().replace(/\s+/g, " ");
  if (!expression) {
    return { ok: false, error: "Enter a 5-field cron expression." };
  }

  const parts = expression.split(" ");
  if (parts.length !== 5) {
    return {
      ok: false,
      error: "Use a standard 5-field cron: minute hour day-of-month month day-of-week.",
    };
  }

  const fields: CronFields = {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };

  try {
    return {
      ok: true,
      fields,
      expression: buildCronExpression(fields),
      allowed: {
        minute: expandCronField(fields.minute, "minute"),
        hour: expandCronField(fields.hour, "hour"),
        dayOfMonth: expandCronField(fields.dayOfMonth, "dayOfMonth"),
        month: expandCronField(fields.month, "month"),
        dayOfWeek: expandCronField(fields.dayOfWeek, "dayOfWeek"),
      },
      wildcard: {
        dayOfMonth: isWildcardField(fields.dayOfMonth),
        dayOfWeek: isWildcardField(fields.dayOfWeek),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid cron expression.",
    };
  }
}

export function applyCronPreset(id: CronPresetId): CronFields {
  return { ...CRON_PRESETS[id].fields };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function isContiguous(values: number[]): boolean {
  return values.every((value, index) => index === 0 || value === values[index - 1] + 1);
}

function starStep(raw: string): number | null {
  const match = raw.trim().match(/^\*\/(\d+)$/);
  if (!match) return null;
  const step = Number(match[1]);
  return step >= 1 ? step : null;
}

function clockTimes(hours: number[], minutes: number[]): string[] {
  const times: string[] = [];
  for (const hour of hours) {
    for (const minute of minutes) {
      times.push(`${pad2(hour)}:${pad2(minute)}`);
    }
  }
  return times;
}

function describeDow(values: number[]): string {
  if (values.length === 5 && values[0] === 1 && values[4] === 5) {
    return "Monday through Friday";
  }
  if (values.length === 2 && values[0] === 0 && values[1] === 6) {
    return "Saturday and Sunday";
  }
  if (isContiguous(values)) {
    if (values.length === 1) return DOW_WORDS[values[0]];
    return `${DOW_WORDS[values[0]]} through ${DOW_WORDS[values[values.length - 1]]}`;
  }
  return joinList(values.map((value) => DOW_WORDS[value]));
}

function describeMonths(values: number[]): string {
  if (isContiguous(values) && values.length > 1) {
    return `${MONTH_WORDS[values[0]]} through ${MONTH_WORDS[values[values.length - 1]]}`;
  }
  return joinList(values.map((value) => MONTH_WORDS[value]));
}

function describeDaysOfMonth(values: number[]): string {
  if (values.length === 1) return `day ${values[0]}`;
  return `days ${joinList(values.map(String))}`;
}

function describeDate(parsed: CronParseSuccess): string {
  const { allowed, wildcard } = parsed;
  const allMonths = allowed.month.length === 12;
  const monthBit = allMonths ? "every month" : describeMonths(allowed.month);

  if (wildcard.dayOfMonth && wildcard.dayOfWeek) {
    if (allMonths) return "every day";
    return `every day in ${describeMonths(allowed.month)}`;
  }

  if (wildcard.dayOfMonth) {
    const dow = describeDow(allowed.dayOfWeek);
    if (allMonths) return `on ${dow}`;
    return `on ${dow} in ${describeMonths(allowed.month)}`;
  }

  if (wildcard.dayOfWeek) {
    return `on ${describeDaysOfMonth(allowed.dayOfMonth)} of ${monthBit}`;
  }

  return `on ${describeDaysOfMonth(allowed.dayOfMonth)} of ${monthBit} and on ${describeDow(allowed.dayOfWeek)}`;
}

function describeTime(parsed: CronParseSuccess): string {
  const { fields, allowed } = parsed;
  const minuteStep = starStep(fields.minute);
  const hourStep = starStep(fields.hour);
  const allMinutes = allowed.minute.length === 60;
  const allHours = allowed.hour.length === 24;
  const dateIsEveryDay =
    parsed.wildcard.dayOfMonth &&
    parsed.wildcard.dayOfWeek &&
    allowed.month.length === 12;

  if (allMinutes && allHours) {
    return "Every minute";
  }

  if (minuteStep && allHours && dateIsEveryDay && fields.minute.trim().startsWith("*")) {
    return `Every ${minuteStep} minutes`;
  }

  if (hourStep && allowed.minute.length === 1 && dateIsEveryDay) {
    if (allowed.minute[0] === 0) {
      return `Every ${hourStep} hours`;
    }
    return `Every ${hourStep} hours at minute ${allowed.minute[0]}`;
  }

  if (allHours && allowed.minute.length === 1) {
    return `At minute ${allowed.minute[0]} of every hour`;
  }

  if (allHours) {
    return `At minutes ${joinList(allowed.minute.map(String))} of every hour`;
  }

  const times = clockTimes(allowed.hour, allowed.minute);
  if (times.length <= 8) {
    return `At ${joinList(times)}`;
  }

  return `At minutes ${joinList(allowed.minute.map(String))} past hours ${joinList(allowed.hour.map(String))}`;
}

export function describeCron(raw: string): { ok: true; summary: string } | CronParseFailure {
  const parsed = parseCronExpression(raw);
  if (!parsed.ok) return parsed;

  const time = describeTime(parsed);
  const date = describeDate(parsed);
  const allMinutes = parsed.allowed.minute.length === 60;
  const allHours = parsed.allowed.hour.length === 24;
  const dateIsEveryDay =
    parsed.wildcard.dayOfMonth &&
    parsed.wildcard.dayOfWeek &&
    parsed.allowed.month.length === 12;

  if (allMinutes && allHours && dateIsEveryDay) {
    return { ok: true, summary: "Every minute" };
  }

  if (time.startsWith("Every ") && dateIsEveryDay) {
    return { ok: true, summary: time };
  }

  if (dateIsEveryDay) {
    if (time.includes("every hour")) {
      return { ok: true, summary: time };
    }
    return { ok: true, summary: `${time} every day` };
  }

  return { ok: true, summary: `${time} ${date}` };
}

function matchesCron(parsed: CronParseSuccess, date: Date): boolean {
  if (!parsed.allowed.minute.includes(date.getMinutes())) return false;
  if (!parsed.allowed.hour.includes(date.getHours())) return false;
  if (!parsed.allowed.month.includes(date.getMonth() + 1)) return false;

  const domMatch = parsed.allowed.dayOfMonth.includes(date.getDate());
  const dowMatch = parsed.allowed.dayOfWeek.includes(date.getDay());

  if (!parsed.wildcard.dayOfMonth && !parsed.wildcard.dayOfWeek) {
    return domMatch || dowMatch;
  }
  return domMatch && dowMatch;
}

export function nextCronRuns(
  raw: string,
  from: Date,
  count = 5,
): { ok: true; runs: Date[] } | CronParseFailure {
  const parsed = parseCronExpression(raw);
  if (!parsed.ok) return parsed;

  const safeCount = Math.min(Math.max(Math.floor(count), 0), 20);
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const runs: Date[] = [];
  const limit = 366 * 24 * 60 * 2;
  for (let i = 0; i < limit && runs.length < safeCount; i += 1) {
    if (matchesCron(parsed, cursor)) {
      runs.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return { ok: true, runs };
}

export function fieldsMatchPreset(fields: CronFields, id: CronPresetId): boolean {
  const preset = CRON_PRESETS[id].fields;
  return (
    fields.minute.trim() === preset.minute &&
    fields.hour.trim() === preset.hour &&
    fields.dayOfMonth.trim() === preset.dayOfMonth &&
    fields.month.trim() === preset.month &&
    fields.dayOfWeek.trim() === preset.dayOfWeek
  );
}
