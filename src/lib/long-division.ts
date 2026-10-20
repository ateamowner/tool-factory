export type LongDivisionStep = {
  /** "integer" while dividing the dividend's digits, "decimal" after the decimal point (bringing down zeros). */
  phase: "integer" | "decimal";
  /** The digit brought down at this step. */
  broughtDown: string;
  /** The number being divided at this step (previous remainder × 10 + brought-down digit). */
  current: string;
  /** How many times the divisor goes into `current`. */
  quotientDigit: string;
  /** quotientDigit × divisor. */
  product: string;
  /** current − product. */
  remainder: string;
};

export type LongDivisionResult =
  | {
      valid: true;
      dividend: string;
      divisor: string;
      /** Scale applied to both numbers to clear decimals (power of 10, as a string), "1" when none. */
      scale: string;
      scaledDividend: string;
      scaledDivisor: string;
      negative: boolean;
      /** Whole-number quotient (no sign). */
      quotient: string;
      /** Whole-number remainder of the scaled division (no sign). */
      remainder: string;
      /** Digits after the decimal point that were worked out. */
      decimalDigits: string;
      /** True when the division ended with remainder 0 within the requested places. */
      terminates: boolean;
      /** Index in decimalDigits where a repeating block starts, or null. */
      repeatStart: number | null;
      /** Signed decimal answer, e.g. "-12.25" or "3.142857". */
      decimal: string;
      steps: LongDivisionStep[];
    }
  | { valid: false; error: string };

export const MAX_DECIMAL_PLACES = 12;
const MAX_DIGITS = 30;

type ParsedDecimal = { negative: boolean; digits: string; fractionLength: number };

/** Parse a user-entered number (commas and spaces allowed) into sign, digits, and decimal places. */
export function parseDecimalInput(raw: unknown): ParsedDecimal | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(cleaned);
  if (!match) return null;
  const [, sign, whole = "", fraction = ""] = match;
  if (whole === "" && fraction === "") return null;
  const digits = (whole + fraction).replace(/^0+(?=\d)/, "") || "0";
  if (digits.length > MAX_DIGITS) return null;
  return { negative: sign === "-", digits, fractionLength: fraction.length };
}

function formatParsed(p: ParsedDecimal): string {
  let digits = p.digits.padStart(p.fractionLength + 1, "0");
  let out = digits;
  if (p.fractionLength > 0) {
    out = `${digits.slice(0, digits.length - p.fractionLength)}.${digits.slice(digits.length - p.fractionLength)}`;
    out = out.replace(/\.?0+$/, "");
  }
  digits = out.replace(/^0+(?=\d)/, "");
  return digits === "0" ? "0" : `${p.negative ? "-" : ""}${digits}`;
}

/**
 * Long division of dividend ÷ divisor with every step, the whole-number quotient and remainder,
 * and the decimal answer to `places` digits (repeating decimals are detected).
 */
export function longDivide(rawDividend: unknown, rawDivisor: unknown, rawPlaces: unknown = 4): LongDivisionResult {
  const a = parseDecimalInput(rawDividend);
  const b = parseDecimalInput(rawDivisor);
  if (!a || !b) return { valid: false, error: "Enter a dividend and a divisor (numbers up to 30 digits)." };

  let places = Math.floor(Number(rawPlaces));
  if (!Number.isFinite(places) || places < 0) places = 0;
  if (places > MAX_DECIMAL_PLACES) places = MAX_DECIMAL_PLACES;

  // Clear decimals by shifting both numbers by the same power of 10.
  const shift = Math.max(a.fractionLength, b.fractionLength);
  const scaledA = BigInt(a.digits) * 10n ** BigInt(shift - a.fractionLength);
  const scaledB = BigInt(b.digits) * 10n ** BigInt(shift - b.fractionLength);
  if (scaledB === 0n) return { valid: false, error: "You can't divide by 0. Enter a divisor other than 0." };

  const negative = scaledA !== 0n && a.negative !== b.negative;
  const dividendDigits = scaledA.toString();
  const steps: LongDivisionStep[] = [];

  let remainder = 0n;
  let quotient = "";
  for (const d of dividendDigits) {
    const current = remainder * 10n + BigInt(d);
    const q = current / scaledB;
    const product = q * scaledB;
    remainder = current - product;
    quotient += q.toString();
    steps.push({
      phase: "integer",
      broughtDown: d,
      current: current.toString(),
      quotientDigit: q.toString(),
      product: product.toString(),
      remainder: remainder.toString(),
    });
  }
  quotient = quotient.replace(/^0+(?=\d)/, "");
  const wholeRemainder = remainder;

  let decimalDigits = "";
  let repeatStart: number | null = null;
  const seen = new Map<string, number>();
  while (remainder !== 0n && decimalDigits.length < places) {
    const key = remainder.toString();
    if (repeatStart === null && seen.has(key)) repeatStart = seen.get(key) ?? null;
    if (!seen.has(key)) seen.set(key, decimalDigits.length);
    const current = remainder * 10n;
    const q = current / scaledB;
    const product = q * scaledB;
    remainder = current - product;
    decimalDigits += q.toString();
    steps.push({
      phase: "decimal",
      broughtDown: "0",
      current: current.toString(),
      quotientDigit: q.toString(),
      product: product.toString(),
      remainder: remainder.toString(),
    });
  }
  if (repeatStart === null && remainder !== 0n && seen.has(remainder.toString())) {
    repeatStart = seen.get(remainder.toString()) ?? null;
  }

  const terminates = remainder === 0n;
  const unsigned = decimalDigits ? `${quotient}.${decimalDigits}` : quotient;
  const decimal = negative && /[1-9]/.test(unsigned) ? `-${unsigned}` : unsigned;

  return {
    valid: true,
    dividend: formatParsed(a),
    divisor: formatParsed(b),
    scale: (10n ** BigInt(shift)).toString(),
    scaledDividend: dividendDigits,
    scaledDivisor: scaledB.toString(),
    negative,
    quotient,
    remainder: wholeRemainder.toString(),
    decimalDigits,
    terminates,
    repeatStart,
    decimal,
    steps,
  };
}
