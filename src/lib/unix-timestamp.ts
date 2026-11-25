/** Inclusive millisecond range the JavaScript Date constructor can represent. */
export const MIN_MS = -8_640_000_000_000_000;
export const MAX_MS = 8_640_000_000_000_000;

/** In auto mode, absolute values at or above this are treated as milliseconds. */
export const AUTO_MS_THRESHOLD = 1e12;

export type UnixUnit = "auto" | "seconds" | "milliseconds";
export type TimeZoneMode = "utc" | "local";

export type UnixSuccess = {
  ok: true;
  unit: "seconds" | "milliseconds";
  milliseconds: number;
  seconds: number;
  integerSeconds: number;
  utc: string;
  local: string;
  iso: string;
  rfc: string;
};

export type UnixFailure = { ok: false; error: string };
export type UnixResult = UnixSuccess | UnixFailure;

export function detectUnit(value: number): "seconds" | "milliseconds" {
  return Math.abs(value) >= AUTO_MS_THRESHOLD ? "milliseconds" : "seconds";
}

export function parseUnixNumber(raw: string): number | null {
  const text = raw.trim().replace(/,/g, "");
  if (!text) return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return null;
  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  return value;
}

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

export function formatUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
}

export function formatLocal(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(date);
}

function fromMilliseconds(ms: number, unit: "seconds" | "milliseconds"): UnixResult {
  if (!Number.isFinite(ms) || ms < MIN_MS || ms > MAX_MS) {
    return { ok: false, error: "Timestamp is outside the range this browser can represent." };
  }
  const milliseconds = Math.trunc(ms);
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Enter a valid Unix timestamp." };
  }
  return {
    ok: true,
    unit,
    milliseconds,
    seconds: milliseconds / 1000,
    integerSeconds: Math.floor(milliseconds / 1000),
    utc: formatUtc(date),
    local: formatLocal(date),
    iso: date.toISOString(),
    rfc: date.toUTCString(),
  };
}

export function unixToDate(raw: string, unit: UnixUnit = "auto"): UnixResult {
  const value = parseUnixNumber(raw);
  if (value === null) {
    return { ok: false, error: raw.trim() ? "Enter a valid number." : "Enter a Unix timestamp." };
  }
  const resolved = unit === "auto" ? detectUnit(value) : unit;
  const ms = resolved === "milliseconds" ? value : value * 1000;
  return fromMilliseconds(ms, resolved);
}

export type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond?: number;
  zone: TimeZoneMode;
};

function isValidDateParts(parts: DateTimeParts): boolean {
  const { year, month, day, hour, minute, second, millisecond = 0, zone } = parts;
  if (
    ![year, month, day, hour, minute, second, millisecond].every((n) => Number.isFinite(n)) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59 ||
    millisecond < 0 ||
    millisecond > 999
  ) {
    return false;
  }
  const ms =
    zone === "utc"
      ? Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
      : new Date(year, month - 1, day, hour, minute, second, millisecond).getTime();
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return false;
  if (zone === "utc") {
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day &&
      date.getUTCHours() === hour &&
      date.getUTCMinutes() === minute &&
      date.getUTCSeconds() === second &&
      date.getUTCMilliseconds() === millisecond
    );
  }
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second &&
    date.getMilliseconds() === millisecond
  );
}

export function datePartsToUnix(parts: DateTimeParts): UnixResult {
  if (!isValidDateParts(parts)) {
    return { ok: false, error: "Enter a valid date and time." };
  }
  const { year, month, day, hour, minute, second, millisecond = 0, zone } = parts;
  const ms =
    zone === "utc"
      ? Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
      : new Date(year, month - 1, day, hour, minute, second, millisecond).getTime();
  return fromMilliseconds(ms, "seconds");
}

export function parseDateTimeInputs(date: string, time: string, zone: TimeZoneMode): UnixResult {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!dateMatch) return { ok: false, error: "Enter a valid date." };
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(time.trim());
  if (!timeMatch) return { ok: false, error: "Enter a valid time." };
  const msRaw = timeMatch[4] ?? "0";
  return datePartsToUnix({
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: Number(timeMatch[3] ?? "0"),
    millisecond: Number(msRaw.padEnd(3, "0")),
    zone,
  });
}

export function formatDateInput(date: Date, zone: TimeZoneMode): string {
  const y = zone === "utc" ? date.getUTCFullYear() : date.getFullYear();
  const m = (zone === "utc" ? date.getUTCMonth() : date.getMonth()) + 1;
  const d = zone === "utc" ? date.getUTCDate() : date.getDate();
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function formatTimeInput(date: Date, zone: TimeZoneMode): string {
  const h = zone === "utc" ? date.getUTCHours() : date.getHours();
  const min = zone === "utc" ? date.getUTCMinutes() : date.getMinutes();
  const s = zone === "utc" ? date.getUTCSeconds() : date.getSeconds();
  return `${pad(h)}:${pad(min)}:${pad(s)}`;
}

export function nowUnix(nowMs = Date.now()) {
  const result = fromMilliseconds(nowMs, "milliseconds");
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result;
}
