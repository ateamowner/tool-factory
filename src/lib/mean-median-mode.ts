function parseNumberList(raw: unknown): { values: number[]; invalid: string[] } {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const values: number[] = [];
  const invalid: string[] = [];
  for (const token of text.split(/[\s,;]+/).filter((t) => t.length > 0)) {
    const n = Number(token);
    if (Number.isFinite(n)) values.push(n);
    else invalid.push(token);
  }
  return { values, invalid };
}

export type MmmResult =
  | {
      valid: true;
      values: number[];
      sorted: number[];
      count: number;
      sum: number;
      mean: number;
      median: number;
      /** Values that occur most often; empty when every value occurs once. */
      modes: number[];
      modeCount: number;
      min: number;
      max: number;
      range: number;
      midrange: number;
    }
  | { valid: false; error: string };

/** Mean, median, mode, range and summary stats for a list of numbers. */
export function computeMeanMedianMode(raw: unknown): MmmResult {
  const { values, invalid } = parseNumberList(raw);
  if (invalid.length > 0) {
    return { valid: false, error: `"${invalid[0]}" is not a number. Separate values with commas, spaces, or new lines.` };
  }
  if (values.length === 0) {
    return { valid: false, error: "Enter at least one number, separated by commas, spaces, or new lines." };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((s, v) => s + v, 0);
  const mean = sum / count;
  const mid = Math.floor(count / 2);
  const median = count % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const freq = new Map<number, number>();
  for (const v of sorted) freq.set(v, (freq.get(v) ?? 0) + 1);
  let modeCount = 0;
  for (const c of freq.values()) if (c > modeCount) modeCount = c;
  const modes = modeCount > 1 ? [...freq.entries()].filter(([, c]) => c === modeCount).map(([v]) => v) : [];

  const min = sorted[0];
  const max = sorted[count - 1];
  return {
    valid: true,
    values,
    sorted,
    count,
    sum,
    mean,
    median,
    modes,
    modeCount: modes.length > 0 ? modeCount : 1,
    min,
    max,
    range: max - min,
    midrange: (min + max) / 2,
  };
}
