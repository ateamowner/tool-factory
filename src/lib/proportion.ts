export type ProportionKey = "a" | "b" | "c" | "d";

export type SolveProportionResult =
  | { valid: true; missing: ProportionKey; value: number; a: number; b: number; c: number; d: number; scale: number }
  | { valid: false; error: string };

/**
 * Solve A : B = C : D (A / B = C / D) when exactly one of the four values is blank (NaN).
 * Uses cross-multiplication: A × D = B × C.
 */
export function solveProportion(a: number, b: number, c: number, d: number): SolveProportionResult {
  const values = { a, b, c, d };
  const blanks = (Object.keys(values) as ProportionKey[]).filter((k) => Number.isNaN(values[k]));
  if (blanks.length !== 1) return { valid: false, error: "Leave exactly one box blank to solve for it." };
  const missing = blanks[0];
  const known = (Object.keys(values) as ProportionKey[]).filter((k) => k !== missing).map((k) => values[k]);
  if (known.some((v) => !Number.isFinite(v))) return { valid: false, error: "Enter three numbers." };
  let value: number;
  if (missing === "a") {
    if (d === 0) return { valid: false, error: "D cannot be zero when solving for A." };
    value = (b * c) / d;
  } else if (missing === "b") {
    if (c === 0) return { valid: false, error: "C cannot be zero when solving for B." };
    value = (a * d) / c;
  } else if (missing === "c") {
    if (b === 0) return { valid: false, error: "B cannot be zero when solving for C." };
    value = (a * d) / b;
  } else {
    if (a === 0) return { valid: false, error: "A cannot be zero when solving for D." };
    value = (b * c) / a;
  }
  const filled = { ...values, [missing]: value };
  if (filled.b === 0 || filled.d === 0) return { valid: false, error: "B and D cannot be zero in a proportion." };
  const scale = filled.a !== 0 ? filled.c / filled.a : filled.d / filled.b;
  return { valid: true, missing, value, a: filled.a, b: filled.b, c: filled.c, d: filled.d, scale };
}

export type CheckProportionResult =
  | {
      valid: true;
      proportional: boolean;
      leftProduct: number;
      rightProduct: number;
      leftRatio: number;
      rightRatio: number;
      scale: number;
    }
  | { valid: false; error: string };

const EPSILON = 1e-9;

/** Check whether A : B = C : D, i.e. A × D equals B × C (within a tiny relative tolerance). */
export function checkProportion(a: number, b: number, c: number, d: number): CheckProportionResult {
  if (![a, b, c, d].every((v) => Number.isFinite(v))) return { valid: false, error: "Enter all four numbers to check." };
  if (b === 0 || d === 0) return { valid: false, error: "B and D cannot be zero." };
  const leftProduct = a * d;
  const rightProduct = b * c;
  const magnitude = Math.max(Math.abs(leftProduct), Math.abs(rightProduct), 1);
  const proportional = Math.abs(leftProduct - rightProduct) <= EPSILON * magnitude;
  const scale = a !== 0 ? c / a : d / b;
  return { valid: true, proportional, leftProduct, rightProduct, leftRatio: a / b, rightRatio: c / d, scale };
}
