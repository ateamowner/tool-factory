export type PercentageMode = "percent-of" | "what-percent" | "percent-change";

export type PercentageResult =
  | {
      valid: true;
      mode: PercentageMode;
      x: number;
      y: number;
      /** The main answer: a number (percent-of) or a percent value (what-percent, percent-change). */
      value: number;
      /** For percent-change: the signed difference y − x. */
      difference?: number;
      /** For percent-change: "increase", "decrease", or "no change". */
      direction?: "increase" | "decrease" | "no change";
    }
  | { valid: false; error: string };

/** Parse a user-entered number, allowing commas, spaces, and a trailing % sign. */
export function parsePercentInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "").replace(/%$/, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Round to 10 decimals to hide floating-point noise and trim trailing zeros. */
export function formatPercentNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Object.is(n, -0) || n === 0) return "0";
  const rounded = Math.round(n * 1e10) / 1e10;
  if (rounded === 0) return "0";
  if (Number.isInteger(rounded)) return String(rounded);
  return String(Number(rounded.toPrecision(12)));
}

/** What is X% of Y?  result = X / 100 × Y */
export function percentOf(x: number, y: number): number {
  return (x / 100) * y;
}

/** X is what percent of Y?  result = X / Y × 100 (null when Y is 0). */
export function whatPercent(x: number, y: number): number | null {
  if (y === 0) return null;
  return (x / y) * 100;
}

/** Percent change from X to Y = (Y − X) / |X| × 100 (null when X is 0). */
export function percentChange(from: number, to: number): number | null {
  if (from === 0) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

export function computePercentage(mode: PercentageMode, rawX: unknown, rawY: unknown): PercentageResult {
  const x = parsePercentInput(rawX);
  const y = parsePercentInput(rawY);
  if (x === null || y === null) {
    return { valid: false, error: "Enter a number in both boxes." };
  }

  if (mode === "percent-of") {
    return { valid: true, mode, x, y, value: percentOf(x, y) };
  }

  if (mode === "what-percent") {
    const value = whatPercent(x, y);
    if (value === null) {
      return { valid: false, error: "The whole (Y) can't be 0 — you can't take a percent of zero." };
    }
    return { valid: true, mode, x, y, value };
  }

  const value = percentChange(x, y);
  if (value === null) {
    return {
      valid: false,
      error: "Percent change from 0 is undefined. Enter a starting value other than 0.",
    };
  }
  const difference = y - x;
  const direction = difference > 0 ? "increase" : difference < 0 ? "decrease" : "no change";
  return { valid: true, mode, x, y, value, difference, direction };
}
