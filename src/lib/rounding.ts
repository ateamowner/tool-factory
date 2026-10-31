// Exact decimal rounding using BigInt so 1.005 rounds like a person expects
// (no binary floating-point surprises).

export type RoundingMode = "half-up" | "half-even" | "ceiling" | "floor";

/** Places: positive/zero = decimal places, -1 = nearest 10, -2 = nearest 100, -3 = nearest 1,000. */
export type RoundingPlace = number;

export const MODE_LABELS: Record<RoundingMode, string> = {
  "half-up": "Half up",
  "half-even": "Half even (banker's)",
  ceiling: "Always up (ceiling)",
  floor: "Always down (floor)",
};

export const MAX_DECIMALS = 20;

export type ParsedDecimal = { negative: boolean; coefficient: bigint; scale: number };

/** Parses "1,234.567", "-0.5", "−2.5", "1.5e3", ".25" into an exact decimal. */
export function parseDecimal(input: string): ParsedDecimal | null {
  const cleaned = input.trim().replace(/[,\s_]/g, "").replace(/[−–]/g, "-");
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(cleaned);
  if (!match) return null;
  const [, sign, intPart = "", fracPart = "", expPart] = match;
  if (intPart === "" && fracPart === "") return null;
  const exp = expPart ? Number(expPart) : 0;
  if (!Number.isFinite(exp) || Math.abs(exp) > 1000) return null;
  let scale = fracPart.length - exp;
  let digits = (intPart + fracPart).replace(/^0+(?=\d)/, "") || "0";
  if (scale < 0) {
    digits = digits + "0".repeat(-scale);
    scale = 0;
  }
  const coefficient = BigInt(digits);
  return { negative: sign === "-" && coefficient !== 0n, coefficient, scale };
}

function pow10(n: number): bigint {
  return 10n ** BigInt(n);
}

/** Formats coefficient × 10^-scale as a plain decimal string. */
export function formatDecimal(negative: boolean, coefficient: bigint, scale: number, grouping = false): string {
  let digits = coefficient.toString();
  let intPart = digits;
  let fracPart = "";
  if (scale > 0) {
    digits = digits.padStart(scale + 1, "0");
    intPart = digits.slice(0, digits.length - scale);
    fracPart = digits.slice(digits.length - scale);
  }
  if (grouping) intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = fracPart ? `${intPart}.${fracPart}` : intPart;
  return negative && coefficient !== 0n ? `-${body}` : body;
}

export function placeLabel(place: RoundingPlace): string {
  if (place === 0) return "the nearest whole number";
  if (place === -1) return "the nearest 10";
  if (place === -2) return "the nearest 100";
  if (place === -3) return "the nearest 1,000";
  if (place < 0) return `the nearest ${formatDecimal(false, pow10(-place), 0, true)}`;
  return place === 1 ? "1 decimal place" : `${place} decimal places`;
}

export type RoundResult =
  | {
      valid: true;
      answer: string;
      formatted: string;
      input: string;
      roundedUp: boolean;
      exact: boolean;
      steps: string[];
    }
  | { valid: false; error: string };

/** Rounds an exact decimal. Returns the rounded value as coefficient/scale. */
export function roundParsed(value: ParsedDecimal, place: RoundingPlace, mode: RoundingMode) {
  const { negative, coefficient, scale } = value;
  // Express target as an integer count of units of 10^-place.
  const shift = scale - place; // digits to drop
  if (shift <= 0) {
    // Already exact at this place; pad to the requested decimals.
    const newScale = Math.max(place, 0);
    const c = coefficient * pow10(newScale - scale);
    return { negative, coefficient: c, scale: newScale, roundedUp: false, exact: true, kept: c, dropped: 0n, divisor: 1n };
  }
  const divisor = pow10(shift);
  let kept = coefficient / divisor;
  const dropped = coefficient % divisor;
  let increment = false;
  if (dropped !== 0n) {
    const twice = dropped * 2n;
    switch (mode) {
      case "half-up":
        increment = twice >= divisor;
        break;
      case "half-even":
        increment = twice > divisor || (twice === divisor && kept % 2n === 1n);
        break;
      case "ceiling":
        increment = !negative;
        break;
      case "floor":
        increment = negative;
        break;
    }
  }
  const keptBefore = kept;
  if (increment) kept += 1n;
  let outCoefficient: bigint;
  let outScale: number;
  if (place >= 0) {
    outCoefficient = kept;
    outScale = place;
  } else {
    outCoefficient = kept * pow10(-place);
    outScale = 0;
  }
  return {
    negative: negative && outCoefficient !== 0n,
    coefficient: outCoefficient,
    scale: outScale,
    roundedUp: increment,
    exact: dropped === 0n,
    kept: keptBefore,
    dropped,
    divisor,
  };
}

function modeExplanation(mode: RoundingMode, negative: boolean, half: boolean, moreThanHalf: boolean): string {
  switch (mode) {
    case "half-up":
      return half || moreThanHalf
        ? `Half up: the dropped part is ${half ? "exactly half" : "more than half"}, so the kept digit moves away from zero${negative ? " (more negative)" : ""}.`
        : "Half up: the dropped part is less than half, so the kept digits stay the same.";
    case "half-even":
      if (half) return "Half even: the dropped part is exactly half, so round to whichever neighbor ends in an even digit.";
      return moreThanHalf
        ? "Half even: the dropped part is more than half, so round away from zero."
        : "Half even: the dropped part is less than half, so the kept digits stay the same.";
    case "ceiling":
      return negative
        ? "Always up (ceiling): round toward positive infinity. For a negative number that means dropping the extra digits, which moves it closer to zero."
        : "Always up (ceiling): any leftover amount bumps the kept digit up.";
    case "floor":
      return negative
        ? "Always down (floor): round toward negative infinity. For a negative number any leftover amount makes it one step more negative."
        : "Always down (floor): drop the extra digits, which moves a positive number down.";
  }
}

export function roundNumber(input: string, place: RoundingPlace, mode: RoundingMode): RoundResult {
  if (input.trim() === "") return { valid: false, error: "Enter a number to round." };
  const parsed = parseDecimal(input);
  if (!parsed) return { valid: false, error: "Enter a valid number, like 3.14159, -2.5 or 1,234.5." };
  if (!Number.isInteger(place) || place > MAX_DECIMALS || place < -12) {
    return { valid: false, error: `Choose between 0 and ${MAX_DECIMALS} decimal places.` };
  }
  const original = formatDecimal(parsed.negative, parsed.coefficient, parsed.scale, true);
  const r = roundParsed(parsed, place, mode);
  const answer = formatDecimal(r.negative, r.coefficient, r.scale);
  const formatted = formatDecimal(r.negative, r.coefficient, r.scale, true);
  const steps: string[] = [`Round ${original} to ${placeLabel(place)} using ${MODE_LABELS[mode].toLowerCase()}.`];
  if (r.exact) {
    steps.push(`${original} has nothing to drop at that place, so no rounding is needed.`);
  } else {
    const half = r.dropped * 2n === r.divisor;
    const moreThanHalf = r.dropped * 2n > r.divisor;
    const shift = r.divisor.toString().length - 1;
    const droppedText = r.dropped.toString().padStart(shift, "0");
    steps.push(
      `Digits being dropped: ${droppedText}${half ? " (exactly half)" : moreThanHalf ? " (more than half)" : " (less than half)"}.`,
    );
    steps.push(modeExplanation(mode, parsed.negative, half, moreThanHalf));
  }
  steps.push(`Answer: ${formatted}`);
  return { valid: true, answer, formatted, input: original, roundedUp: r.roundedUp, exact: r.exact, steps };
}

/** Rounds the same number with every mode for a side-by-side comparison. */
export function compareModes(input: string, place: RoundingPlace): { mode: RoundingMode; label: string; answer: string }[] {
  const parsed = parseDecimal(input);
  if (!parsed) return [];
  return (Object.keys(MODE_LABELS) as RoundingMode[]).map((mode) => {
    const r = roundParsed(parsed, place, mode);
    return { mode, label: MODE_LABELS[mode], answer: formatDecimal(r.negative, r.coefficient, r.scale, true) };
  });
}
