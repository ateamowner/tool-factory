// Significant figures: count sig figs in a typed number and round to N sig figs.
// Works on the digits as typed (exact decimal math, no binary floating point).

export const MAX_SIG_FIGS = 30;

export type ParsedNumber = {
  negative: boolean;
  intPart: string;
  fracPart: string;
  hasPoint: boolean;
  exponent: number;
  scientificInput: boolean;
};

export type DigitMark = { char: string; kind: "sig" | "leading" | "ambiguous" | "point" | "sign" };

export type CountResult =
  | {
      valid: true;
      sigFigs: number;
      maxSigFigs: number;
      ambiguous: boolean;
      isZero: boolean;
      marks: DigitMark[];
      decimalPlaces: number | null;
      scientific: string;
      steps: string[];
    }
  | { valid: false; error: string };

export type RoundResult =
  | { valid: true; standard: string; scientific: string; eNotation: string; ambiguousZeros: boolean; steps: string[] }
  | { valid: false; error: string };

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

export function superscript(n: number): string {
  return String(n).split("").map((c) => SUPERSCRIPT[c] ?? c).join("");
}

export function parseNumber(input: string): ParsedNumber | null {
  const cleaned = input
    .trim()
    .replace(/[\u2212\u2013]/g, "-")
    .replace(/[\s,_]/g, "")
    .replace(/(?:×|x|X|\*)10\^?/g, "e")
    .replace(/×10/g, "e");
  const m = /^([+-])?(\d*)(\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(cleaned);
  if (!m) return null;
  const intPart = m[2] ?? "";
  const fracPart = m[4] ?? "";
  if (intPart.length + fracPart.length === 0) return null;
  const exponent = m[5] ? Number(m[5]) : 0;
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 10000) return null;
  return {
    negative: m[1] === "-",
    intPart,
    fracPart,
    hasPoint: m[3] !== undefined,
    exponent,
    scientificInput: m[5] !== undefined,
  };
}

const INVALID = "Enter a number like 0.00450, 1,200, 3.0e8 or 6.02 × 10^23.";

/** Digits D (no leading/trailing zeros) and power p so |value| = D × 10^p. Null for zero. */
function coefficient(p: ParsedNumber): { digits: string; power: number } | null {
  const all = p.intPart + p.fracPart;
  const first = all.search(/[1-9]/);
  if (first === -1) return null;
  let last = all.length - 1;
  while (all[last] === "0") last--;
  return { digits: all.slice(first, last + 1), power: p.exponent - p.fracPart.length + (all.length - 1 - last) };
}

function toScientific(negative: boolean, digits: string, power: number): { pretty: string; e: string } {
  const exp = power + digits.length - 1;
  const mantissa = digits.length > 1 ? `${digits[0]}.${digits.slice(1)}` : digits;
  const sign = negative ? "-" : "";
  return { pretty: `${sign}${mantissa} × 10${superscript(exp)}`, e: `${sign}${mantissa}e${exp >= 0 ? "+" : ""}${exp}` };
}

function groupInt(s: string): string {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toStandard(negative: boolean, digits: string, power: number): string | null {
  const exp = power + digits.length - 1;
  if (exp > 21 || exp < -21) return null;
  let body: string;
  if (power >= 0) body = groupInt(digits + "0".repeat(power));
  else {
    const pointAt = digits.length + power;
    if (pointAt > 0) body = `${groupInt(digits.slice(0, pointAt))}.${digits.slice(pointAt)}`;
    else body = `0.${"0".repeat(-pointAt)}${digits}`;
  }
  return (negative ? "-" : "") + body;
}

export function countSigFigs(input: string): CountResult {
  const p = parseNumber(input);
  if (!p) return { valid: false, error: INVALID };
  const all = p.intPart + p.fracPart;
  const first = all.search(/[1-9]/);
  const marks: DigitMark[] = [];
  if (p.negative) marks.push({ char: "-", kind: "sign" });
  const steps: string[] = [];

  if (first === -1) {
    // Zero: only zeros after the decimal point carry precision (0.00 has 2), plain 0 counts as 1.
    const sig = p.hasPoint && p.fracPart.length > 0 ? p.fracPart.length : 1;
    for (let i = 0; i < all.length; i++) {
      if (i === p.intPart.length && p.hasPoint) marks.push({ char: ".", kind: "point" });
      const sigZero = p.hasPoint && p.fracPart.length > 0 ? i >= p.intPart.length : i === all.length - 1;
      marks.push({ char: all[i], kind: sigZero ? "sig" : "leading" });
    }
    if (p.hasPoint && p.fracPart.length === 0) marks.push({ char: ".", kind: "point" });
    steps.push("The value is zero, so there are no nonzero digits to start from.");
    steps.push(
      sig === 1 && !(p.hasPoint && p.fracPart.length > 0)
        ? "By convention a plain 0 is counted as 1 significant figure."
        : `Zeros written after the decimal point show precision, so this zero has ${sig} significant figure${sig === 1 ? "" : "s"}.`,
    );
    return { valid: true, sigFigs: sig, maxSigFigs: sig, ambiguous: false, isZero: true, marks, decimalPlaces: p.scientificInput ? null : p.fracPart.length, scientific: "0", steps };
  }

  let last = all.length - 1;
  while (all[last] === "0") last--;
  const trailingZeros = all.length - 1 - last;
  const leadingZeros = first;
  let sig: number;
  let max: number;
  let ambiguous = false;
  if (p.hasPoint) {
    sig = all.length - first;
    max = sig;
  } else {
    sig = last - first + 1;
    max = sig + trailingZeros;
    ambiguous = trailingZeros > 0;
  }

  for (let i = 0; i < all.length; i++) {
    if (p.hasPoint && i === p.intPart.length) marks.push({ char: ".", kind: "point" });
    let kind: DigitMark["kind"] = "sig";
    if (i < first) kind = "leading";
    else if (i > last && !p.hasPoint) kind = "ambiguous";
    marks.push({ char: all[i], kind });
  }
  if (p.hasPoint && p.fracPart.length === 0) marks.push({ char: ".", kind: "point" });

  if (leadingZeros > 0) steps.push(`Skip the ${leadingZeros} leading zero${leadingZeros === 1 ? "" : "s"}. Zeros before the first nonzero digit only hold the decimal place.`);
  steps.push(`Start counting at the first nonzero digit, ${all[first]}.`);
  const middle = all.slice(first, last + 1).replace(/[1-9]/g, "").length;
  if (middle > 0) steps.push(`Count the ${middle} zero${middle === 1 ? "" : "s"} between nonzero digits. Sandwiched zeros are always significant.`);
  if (trailingZeros > 0 && p.hasPoint) steps.push(`Count the ${trailingZeros} trailing zero${trailingZeros === 1 ? "" : "s"}. Because the number has a decimal point, trailing zeros are significant.`);
  if (ambiguous) steps.push(`The ${trailingZeros} trailing zero${trailingZeros === 1 ? "" : "s"} with no decimal point ${trailingZeros === 1 ? "is" : "are"} ambiguous. They are usually not counted, so the answer is ${sig}, but it could be as many as ${max} if the zeros were measured. Write it in scientific notation or add a decimal point to make it clear.`);
  if (p.scientificInput) steps.push("In scientific notation only the digits before the × 10 part count; the exponent never adds significant figures.");
  steps.push(`Total: ${sig} significant figure${sig === 1 ? "" : "s"}.`);

  const sigDigits = p.hasPoint ? all.slice(first) : all.slice(first, last + 1);
  const coef = coefficient(p)!;
  const exp = coef.power + coef.digits.length - 1;
  const mantissa = sigDigits.length > 1 ? `${sigDigits[0]}.${sigDigits.slice(1)}` : sigDigits;
  const scientific = `${p.negative ? "-" : ""}${mantissa} × 10${superscript(exp)}`;
  return { valid: true, sigFigs: sig, maxSigFigs: max, ambiguous, isZero: false, marks, decimalPlaces: p.scientificInput ? null : p.fracPart.length, scientific, steps };
}

export function roundToSigFigs(input: string, n: number): RoundResult {
  if (!Number.isInteger(n) || n < 1 || n > MAX_SIG_FIGS) return { valid: false, error: `Choose 1 to ${MAX_SIG_FIGS} significant figures.` };
  const p = parseNumber(input);
  if (!p) return { valid: false, error: INVALID };
  const coef = coefficient(p);
  if (!coef) {
    const standard = n > 1 ? `0.${"0".repeat(n - 1)}` : "0";
    return { valid: true, standard, scientific: "0", eNotation: "0", ambiguousZeros: false, steps: ["Zero stays zero at any number of significant figures."] };
  }
  let { digits, power } = coef;
  const steps: string[] = [];
  const original = digits;
  if (digits.length > n) {
    const kept = digits.slice(0, n);
    const next = digits[n];
    power += digits.length - n;
    steps.push(`Keep the first ${n} significant digit${n === 1 ? "" : "s"} (${kept}) and look at the next digit, ${next}.`);
    if (next >= "5") {
      let bumped = (BigInt(kept) + BigInt(1)).toString();
      steps.push(`${next} is 5 or more, so round up: ${kept} becomes ${bumped}.`);
      if (bumped.length > n) {
        bumped = bumped.slice(0, n);
        power += 1;
      }
      digits = bumped;
    } else {
      steps.push(`${next} is less than 5, so drop it and everything after it.`);
      digits = kept;
    }
  } else if (digits.length < n) {
    steps.push(`The number has ${digits.length} significant digit${digits.length === 1 ? "" : "s"}, so add ${n - digits.length} zero${n - digits.length === 1 ? "" : "s"} to show ${n} significant figures.`);
    power -= n - digits.length;
    digits = digits + "0".repeat(n - digits.length);
  } else {
    steps.push(`${original} already has exactly ${n} significant figure${n === 1 ? "" : "s"}.`);
  }

  // Keep exactly n digits in the coefficient so zeros we mean to show are kept.
  const sci = toScientific(p.negative, digits, power);
  let standard = toStandard(p.negative, digits, power);
  let ambiguousZeros = false;
  if (standard !== null && power >= 0 && digits.endsWith("0")) {
    if (power === 0) {
      standard += ".";
      steps.push("The last significant digit is a zero in the ones place, so a decimal point is added to show it counts.");
    } else {
      ambiguousZeros = true;
    }
  } else if (standard !== null && power > 0) {
    ambiguousZeros = true;
  }
  if (ambiguousZeros) steps.push(`Trailing zeros in ${standard} are only placeholders. Use ${sci.pretty} to show exactly ${n} significant figures.`);
  if (standard === null) standard = sci.pretty;
  steps.push(`Answer: ${standard}${standard === sci.pretty ? "" : `, or ${sci.pretty} in scientific notation`}.`);
  return { valid: true, standard, scientific: sci.pretty, eNotation: sci.e, ambiguousZeros, steps };
}
