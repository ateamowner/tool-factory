export type SlopeResult =
  | {
      valid: true;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      rise: number;
      run: number;
      vertical: boolean;
      horizontal: boolean;
      /** Slope m; null when the line is vertical. */
      slope: number | null;
      /** Angle in degrees from the positive x-axis; null when vertical. */
      angleDegrees: number | null;
      /** y-intercept; null when vertical. */
      intercept: number | null;
      /** Point-slope form string, or "x = …" for a vertical line. */
      equation: string;
    }
  | { valid: false; error: string };

function parseCoord(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Format a number for display in equations (trim trailing zeros). */
export function formatSlopeNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Object.is(n, -0) || n === 0) return "0";
  const rounded = Math.round(n * 1e10) / 1e10;
  if (Number.isInteger(rounded)) return String(rounded);
  const s = rounded.toPrecision(12).replace(/\.?0+$/, "");
  return s;
}

/** Slope between two points (x1,y1) and (x2,y2): m = rise/run. */
export function computeSlope(
  rawX1: unknown,
  rawY1: unknown,
  rawX2: unknown,
  rawY2: unknown,
): SlopeResult {
  const x1 = parseCoord(rawX1);
  const y1 = parseCoord(rawY1);
  const x2 = parseCoord(rawX2);
  const y2 = parseCoord(rawY2);

  if (x1 === null || y1 === null || x2 === null || y2 === null) {
    return { valid: false, error: "Enter four finite numbers for (x1, y1) and (x2, y2)." };
  }

  if (x1 === x2 && y1 === y2) {
    return { valid: false, error: "The two points are the same. Pick distinct points." };
  }

  const rise = y2 - y1;
  const run = x2 - x1;
  const vertical = run === 0;
  const horizontal = rise === 0;

  if (vertical) {
    return {
      valid: true,
      x1,
      y1,
      x2,
      y2,
      rise,
      run,
      vertical: true,
      horizontal: false,
      slope: null,
      angleDegrees: null,
      intercept: null,
      equation: `x = ${formatSlopeNumber(x1)}`,
    };
  }

  const slope = rise / run;
  const angleDegrees = (Math.atan(slope) * 180) / Math.PI;
  const intercept = y1 - slope * x1;
  const mStr = formatSlopeNumber(slope);
  const x1Str = formatSlopeNumber(x1);
  const y1Str = formatSlopeNumber(y1);
  const sign = x1 >= 0 ? "−" : "+";
  const absX1 = formatSlopeNumber(Math.abs(x1));
  const equation =
    horizontal
      ? `y = ${y1Str}`
      : `y − ${y1Str} = ${mStr}(x ${sign} ${absX1})`;

  return {
    valid: true,
    x1,
    y1,
    x2,
    y2,
    rise,
    run,
    vertical: false,
    horizontal,
    slope,
    angleDegrees,
    intercept,
    equation,
  };
}
