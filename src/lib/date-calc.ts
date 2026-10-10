export type DateParts = { y: number; m: number; d: number };

const DAY_MS = 86_400_000;

export function parseIsoDate(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
  return { y, m, d };
}

function toUtc(p: DateParts): number {
  return Date.UTC(p.y, p.m - 1, p.d);
}

function fromUtc(ms: number): DateParts {
  const t = new Date(ms);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function formatIso(p: DateParts): string {
  return `${String(p.y).padStart(4, "0")}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export type DiffResult = {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  weeks: number;
  remainderDays: number;
  businessDays: number;
};

/** Difference from start to end (end exclusive). Set includeEnd to count the end day. */
export function diffDates(start: DateParts, end: DateParts, includeEnd = false): DiffResult {
  let a = start;
  let b = end;
  let sign = 1;
  if (toUtc(b) < toUtc(a)) {
    [a, b] = [b, a];
    sign = -1;
  }
  const extra = includeEnd ? 1 : 0;
  const total = Math.round((toUtc(b) - toUtc(a)) / DAY_MS) + extra;

  let years = b.y - a.y;
  let months = b.m - a.m;
  let days = b.d - a.d;
  if (days < 0) {
    months -= 1;
    const pm = b.m === 1 ? 12 : b.m - 1;
    const py = b.m === 1 ? b.y - 1 : b.y;
    days += daysInMonth(py, pm);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  days += extra;

  let business = 0;
  const startMs = toUtc(a);
  for (let i = 0; i < total; i++) {
    const dow = new Date(startMs + i * DAY_MS).getUTCDay();
    if (dow !== 0 && dow !== 6) business++;
  }

  return {
    totalDays: sign * total,
    years,
    months,
    days,
    weeks: Math.floor(total / 7),
    remainderDays: total % 7,
    businessDays: business,
  };
}

export type AddAmounts = { years: number; months: number; weeks: number; days: number };

/** Add (or subtract with negative amounts) years, months, weeks, and days. Month-end dates clamp (Jan 31 + 1 month = Feb 28/29). */
export function addToDate(start: DateParts, amounts: AddAmounts): DateParts {
  const totalMonths = start.m - 1 + amounts.years * 12 + amounts.months;
  const y = start.y + Math.floor(totalMonths / 12);
  const m = (((totalMonths % 12) + 12) % 12) + 1;
  const d = Math.min(start.d, daysInMonth(y, m));
  const ms = Date.UTC(y, m - 1, d) + (amounts.weeks * 7 + amounts.days) * DAY_MS;
  return fromUtc(ms);
}

export function weekdayName(p: DateParts): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    new Date(toUtc(p)).getUTCDay()
  ];
}
