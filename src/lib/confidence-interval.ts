import { normalUpper, tUpper } from "./pvalue.ts";

export type CiMethod = "z" | "t";

export type MeanCiResult =
  | {
      valid: true;
      method: CiMethod;
      df: number | null;
      critical: number;
      standardError: number;
      margin: number;
      lower: number;
      upper: number;
    }
  | { valid: false; error: string };

export type ProportionCiResult =
  | {
      valid: true;
      phat: number;
      critical: number;
      standardError: number;
      margin: number;
      lower: number;
      upper: number;
      wilsonLower: number;
      wilsonUpper: number;
    }
  | { valid: false; error: string };

/** Critical z so that P(|Z| < z) = confidence (confidence as a fraction, e.g. 0.95). */
export function zCritical(confidence: number): number {
  const tail = (1 - confidence) / 2;
  let lo = 0;
  let hi = 40;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (normalUpper(mid) > tail) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Critical t so that P(|T| < t) = confidence with df degrees of freedom. */
export function tCritical(confidence: number, df: number): number {
  const tail = (1 - confidence) / 2;
  let lo = 0;
  let hi = 1;
  while (tUpper(hi, df) > tail && hi < 1e12) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tUpper(mid, df) > tail) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function checkConfidence(levelPercent: number): string | null {
  if (!Number.isFinite(levelPercent) || levelPercent <= 0 || levelPercent >= 100) {
    return "Enter a confidence level above 0 and below 100, such as 95.";
  }
  return null;
}

/** Confidence interval for a mean from summary statistics. */
export function meanConfidenceInterval(input: {
  mean: number;
  sd: number;
  n: number;
  levelPercent: number;
  method: CiMethod;
}): MeanCiResult {
  const { mean, sd, n, levelPercent, method } = input;
  const bad = checkConfidence(levelPercent);
  if (bad) return { valid: false, error: bad };
  if (!Number.isFinite(mean)) return { valid: false, error: "Enter the sample mean as a number." };
  if (!Number.isFinite(sd) || sd < 0) return { valid: false, error: "Enter a standard deviation of 0 or more." };
  if (!Number.isInteger(n) || n < 1) return { valid: false, error: "Enter a whole sample size of 1 or more." };
  if (method === "t" && n < 2) return { valid: false, error: "A t interval needs a sample size of at least 2." };
  const confidence = levelPercent / 100;
  const df = method === "t" ? n - 1 : null;
  const critical = method === "t" ? tCritical(confidence, n - 1) : zCritical(confidence);
  const standardError = sd / Math.sqrt(n);
  const margin = critical * standardError;
  return { valid: true, method, df, critical, standardError, margin, lower: mean - margin, upper: mean + margin };
}

/** Confidence interval for a proportion (normal approximation, plus the Wilson interval). */
export function proportionConfidenceInterval(input: {
  successes: number;
  n: number;
  levelPercent: number;
}): ProportionCiResult {
  const { successes, n, levelPercent } = input;
  const bad = checkConfidence(levelPercent);
  if (bad) return { valid: false, error: bad };
  if (!Number.isInteger(n) || n < 1) return { valid: false, error: "Enter a whole sample size of 1 or more." };
  if (!Number.isInteger(successes) || successes < 0 || successes > n) {
    return { valid: false, error: "Successes must be a whole number from 0 up to the sample size." };
  }
  const z = zCritical(levelPercent / 100);
  const phat = successes / n;
  const standardError = Math.sqrt((phat * (1 - phat)) / n);
  const margin = z * standardError;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (phat + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((phat * (1 - phat)) / n + z2 / (4 * n * n))) / denom;
  return {
    valid: true,
    phat,
    critical: z,
    standardError,
    margin,
    lower: Math.max(0, phat - margin),
    upper: Math.min(1, phat + margin),
    wilsonLower: Math.max(0, center - half),
    wilsonUpper: Math.min(1, center + half),
  };
}
