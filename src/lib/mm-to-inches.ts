export const MM_PER_INCH = 25.4;

export type MmToInchesMode = "mm_to_in" | "in_to_mm";

export type MmToInchesStatus = "ok" | "invalid" | "value_required";

export type MmToInchesInput = {
  mode: MmToInchesMode;
  millimeters: number;
  inches: number;
};

export type InchFraction = {
  whole: number;
  numerator: number;
  denominator: number;
  /** Distance from the exact decimal to this reduced fraction, in inches. */
  remainderInches: number;
  label: string;
};

export type MmToInchesResult = {
  status: MmToInchesStatus;
  valid: boolean;
  error: string | null;
  mode: MmToInchesMode;
  millimeters: number | null;
  inches: number | null;
  fraction: InchFraction | null;
};

const MODES: MmToInchesMode[] = ["mm_to_in", "in_to_mm"];

const emptyResult = (
  status: MmToInchesStatus,
  error: string,
  mode: MmToInchesMode,
): MmToInchesResult => ({
  status,
  valid: false,
  error,
  mode,
  millimeters: null,
  inches: null,
  fraction: null,
});

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function isNonNegativeFinite(value: number): boolean {
  return isFiniteNumber(value) && value >= 0;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

/** Inches = millimeters / 25.4. */
export function mmToInches(millimeters: number): number {
  return millimeters / MM_PER_INCH;
}

/** Millimeters = inches × 25.4. */
export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export function formatLength(value: number, unit: "mm" | "in"): string {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
  return `${formatted} ${unit}`;
}

export function formatInchFraction(fraction: InchFraction): string {
  return fraction.label;
}

function fractionLabel(whole: number, numerator: number, denominator: number): string {
  if (numerator === 0) {
    return `${whole} in`;
  }
  if (whole === 0) {
    return `${numerator}/${denominator} in`;
  }
  return `${whole} ${numerator}/${denominator} in`;
}

/** Nearest reduced fraction at or below maxDenominator (default 1/64 in). */
export function inchesToNearestFraction(
  inches: number,
  maxDenominator = 64,
): InchFraction {
  if (!isFiniteNumber(inches) || maxDenominator < 1) {
    return {
      whole: 0,
      numerator: 0,
      denominator: 1,
      remainderInches: Number.NaN,
      label: "—",
    };
  }

  const sign = inches < 0 ? -1 : 1;
  const abs = Math.abs(inches);
  const wholeAbs = Math.floor(abs + Number.EPSILON);
  const fractional = abs - wholeAbs;
  let numerator = Math.round(fractional * maxDenominator);
  let whole = wholeAbs;

  if (numerator === 0) {
    const remainderInches = inches - sign * whole;
    return {
      whole: sign * whole,
      numerator: 0,
      denominator: 1,
      remainderInches,
      label: fractionLabel(sign * whole, 0, 1),
    };
  }

  if (numerator === maxDenominator) {
    whole += 1;
    const remainderInches = inches - sign * whole;
    return {
      whole: sign * whole,
      numerator: 0,
      denominator: 1,
      remainderInches,
      label: fractionLabel(sign * whole, 0, 1),
    };
  }

  const divisor = gcd(numerator, maxDenominator);
  numerator /= divisor;
  const denominator = maxDenominator / divisor;
  const exact = sign * (whole + numerator / denominator);
  return {
    whole: sign * whole,
    numerator,
    denominator,
    remainderInches: inches - exact,
    label: fractionLabel(sign * whole, numerator, denominator),
  };
}

export function convertMmInches(input: MmToInchesInput): MmToInchesResult {
  const mode = input.mode;
  if (!MODES.includes(mode)) {
    return emptyResult("invalid", "Choose millimeters to inches or inches to millimeters.", "mm_to_in");
  }

  if (mode === "mm_to_in") {
    if (!isFiniteNumber(input.millimeters)) {
      return emptyResult("invalid", "Enter a finite millimeter value of 0 or more.", mode);
    }

    if (input.millimeters < 0) {
      return emptyResult(
        "value_required",
        "Millimeters must be 0 or more. Length conversions use the international inch (25.4 mm).",
        mode,
      );
    }

    if (!isNonNegativeFinite(input.millimeters)) {
      return emptyResult("invalid", "Enter a finite millimeter value of 0 or more.", mode);
    }

    const millimeters = input.millimeters;
    const inches = mmToInches(millimeters);
    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      millimeters,
      inches,
      fraction: inchesToNearestFraction(inches),
    };
  }

  if (!isFiniteNumber(input.inches)) {
    return emptyResult("invalid", "Enter a finite inch value of 0 or more.", mode);
  }

  if (input.inches < 0) {
    return emptyResult(
      "value_required",
      "Inches must be 0 or more. Length conversions use the international inch (25.4 mm).",
      mode,
    );
  }

  if (!isNonNegativeFinite(input.inches)) {
    return emptyResult("invalid", "Enter a finite inch value of 0 or more.", mode);
  }

  const inches = input.inches;
  const millimeters = inchesToMm(inches);
  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    millimeters,
    inches,
    fraction: inchesToNearestFraction(inches),
  };
}
