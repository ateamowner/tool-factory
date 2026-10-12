export function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
}

function decimals(n: number): number {
  const s = String(n);
  if (s.includes("e-")) return Number(s.split("e-")[1]);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}

export type SimplifyResult =
  | { valid: true; left: number; right: number; factor: number; decimal: number; percentLeft: number; percentRight: number; oneTo: number }
  | { valid: false; error: string };

export function simplifyRatio(a: number, b: number): SimplifyResult {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return { valid: false, error: "Enter two numbers." };
  if (a < 0 || b < 0) return { valid: false, error: "Use positive numbers." };
  if (a === 0 || b === 0) return { valid: false, error: "Both sides must be greater than zero." };
  const places = Math.min(Math.max(decimals(a), decimals(b)), 9);
  const scale = 10 ** places;
  const ia = Math.round(a * scale);
  const ib = Math.round(b * scale);
  const g = gcd(ia, ib) || 1;
  const total = a + b;
  return {
    valid: true,
    left: ia / g,
    right: ib / g,
    factor: g / scale,
    decimal: a / b,
    percentLeft: (a / total) * 100,
    percentRight: (b / total) * 100,
    oneTo: b / a,
  };
}

export type SolveResult =
  | { valid: true; missing: "a" | "b" | "c" | "d"; value: number; a: number; b: number; c: number; d: number }
  | { valid: false; error: string };

/** Solve A : B = C : D when exactly one of the four values is blank (NaN). */
export function solveRatio(a: number, b: number, c: number, d: number): SolveResult {
  const values = { a, b, c, d };
  const blanks = (Object.keys(values) as ("a" | "b" | "c" | "d")[]).filter((k) => Number.isNaN(values[k]));
  if (blanks.length !== 1) return { valid: false, error: "Leave exactly one box blank to solve for it." };
  const missing = blanks[0];
  const known = Object.entries(values).filter(([k]) => k !== missing).map(([, v]) => v);
  if (known.some((v) => !Number.isFinite(v))) return { valid: false, error: "Enter three numbers." };
  let value: number;
  if (missing === "a") {
    if (d === 0) return { valid: false, error: "D cannot be zero." };
    value = (b * c) / d;
  } else if (missing === "b") {
    if (c === 0) return { valid: false, error: "C cannot be zero." };
    value = (a * d) / c;
  } else if (missing === "c") {
    if (b === 0) return { valid: false, error: "B cannot be zero." };
    value = (a * d) / b;
  } else {
    if (a === 0) return { valid: false, error: "A cannot be zero." };
    value = (b * c) / a;
  }
  const filled = { ...values, [missing]: value };
  return { valid: true, missing, value, a: filled.a, b: filled.b, c: filled.c, d: filled.d };
}

export function formatNumber(n: number, maxDigits = 4): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: maxDigits });
}
