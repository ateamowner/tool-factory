export type StdDevResult =
  | {
      valid: true;
      values: number[];
      count: number;
      sum: number;
      mean: number;
      /** Squared deviations (x − mean)² in input order. */
      squaredDeviations: number[];
      /** Sum of squared deviations Σ(x − mean)². */
      sumSquares: number;
      populationVariance: number;
      populationStdDev: number;
      /** Sample variance; null when there is only one value. */
      sampleVariance: number | null;
      /** Sample standard deviation; null when there is only one value. */
      sampleStdDev: number | null;
    }
  | { valid: false; error: string };

/** Split a list of numbers on commas, spaces, semicolons, tabs, or newlines. */
export function parseNumberList(raw: unknown): { values: number[]; invalid: string[] } {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const tokens = text
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const values: number[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    const n = Number(token);
    if (Number.isFinite(n)) values.push(n);
    else invalid.push(token);
  }
  return { values, invalid };
}

/** Format a number for display (round to 10 decimals, trim trailing zeros). */
export function formatStatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Object.is(n, -0) || n === 0) return "0";
  const rounded = Math.round(n * 1e10) / 1e10;
  if (rounded === 0) return "0";
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toPrecision(12).replace(/\.?0+$/, "");
}

/** Population and sample standard deviation for a list of numbers. */
export function computeStandardDeviation(raw: unknown): StdDevResult {
  const { values, invalid } = parseNumberList(raw);

  if (invalid.length > 0) {
    return {
      valid: false,
      error: `"${invalid[0]}" is not a number. Separate values with commas, spaces, or new lines.`,
    };
  }
  if (values.length === 0) {
    return { valid: false, error: "Enter at least one number, separated by commas, spaces, or new lines." };
  }

  const count = values.length;
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / count;
  const squaredDeviations = values.map((v) => (v - mean) ** 2);
  const sumSquares = squaredDeviations.reduce((acc, v) => acc + v, 0);
  const populationVariance = sumSquares / count;
  const populationStdDev = Math.sqrt(populationVariance);
  const sampleVariance = count > 1 ? sumSquares / (count - 1) : null;
  const sampleStdDev = sampleVariance === null ? null : Math.sqrt(sampleVariance);

  return {
    valid: true,
    values,
    count,
    sum,
    mean,
    squaredDeviations,
    sumSquares,
    populationVariance,
    populationStdDev,
    sampleVariance,
    sampleStdDev,
  };
}
