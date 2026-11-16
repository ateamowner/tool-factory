export type QuartileMethod = "exclusive" | "inclusive";

export type IqrResult =
  | { valid: false; error: string }
  | {
      valid: true;
      method: QuartileMethod;
      count: number;
      min: number;
      q1: number;
      median: number;
      q3: number;
      max: number;
      iqr: number;
      lowerFence: number;
      upperFence: number;
      outliers: number[];
      sorted: number[];
    };

export function parseNumbers(input: string): number[] | null {
  const tokens = input.split(/[\s,;]+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return [];
  const out: number[] = [];
  for (const t of tokens) {
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    out.push(n);
  }
  return out;
}

/** Percentile p (0..1) of an ascending sorted array. */
export function quantile(sorted: number[], p: number, method: QuartileMethod): number {
  const n = sorted.length;
  // exclusive: position (n + 1) p (QUARTILE.EXC); inclusive: 1 + (n - 1) p (QUARTILE.INC)
  const pos = method === "exclusive" ? (n + 1) * p : 1 + (n - 1) * p;
  if (pos <= 1) return sorted[0];
  if (pos >= n) return sorted[n - 1];
  const lo = Math.floor(pos);
  const frac = pos - lo;
  return sorted[lo - 1] + frac * (sorted[lo] - sorted[lo - 1]);
}

function clean(x: number): number {
  return Number(x.toPrecision(12));
}

export function iqr(input: string, method: QuartileMethod = "exclusive"): IqrResult {
  const nums = parseNumbers(input);
  if (nums === null) return { valid: false, error: "Enter numbers only, separated by commas, spaces or new lines." };
  if (nums.length < 2) return { valid: false, error: "Enter at least two numbers." };
  const sorted = [...nums].sort((a, b) => a - b);
  const q1 = clean(quantile(sorted, 0.25, method));
  const median = clean(quantile(sorted, 0.5, method));
  const q3 = clean(quantile(sorted, 0.75, method));
  const range = clean(q3 - q1);
  const lowerFence = clean(q1 - 1.5 * range);
  const upperFence = clean(q3 + 1.5 * range);
  return {
    valid: true,
    method,
    count: sorted.length,
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1],
    iqr: range,
    lowerFence,
    upperFence,
    outliers: sorted.filter((x) => x < lowerFence || x > upperFence),
    sorted,
  };
}
