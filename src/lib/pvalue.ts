export type TestType = "z" | "t" | "chi";
export type Tail = "two" | "right" | "left";

export type PValueResult =
  | {
      valid: true;
      p: number;
      pText: string;
      cdf: number;
      critical: string;
      alpha: number;
      significant: boolean;
      decision: string;
      description: string;
    }
  | { valid: false; error: string };

export function parseNum(raw: string): number | null {
  const s = raw.trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function logGamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Regularized lower incomplete gamma P(a, x). */
export function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  const gln = logGamma(a);
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 500; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-15) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - gln);
  }
  let b = x + 1 - a;
  let c = 1 / 1e-300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
}

function betaCf(a: number, b: number, x: number): number {
  const tiny = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 500; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}

/** Regularized incomplete beta I_x(a, b). */
export function betaI(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) return (bt * betaCf(a, b, x)) / a;
  return 1 - (bt * betaCf(b, a, 1 - x)) / b;
}

/** Upper tail of the standard normal, Q(z) = P(Z > z), accurate in the tails. */
export function normalUpper(z: number): number {
  // Q(z) = 0.5 * erfc(z / sqrt 2), computed via incomplete gamma
  const x = Math.abs(z) / Math.SQRT2;
  const erfc = x === 0 ? 1 : x < 1.5 ? 1 - gammaP(0.5, x * x) : upperGammaQ(0.5, x * x);
  const q = 0.5 * erfc;
  return z >= 0 ? q : 1 - q;
}

function upperGammaQ(a: number, x: number): number {
  if (x < a + 1) return 1 - gammaP(a, x);
  const gln = logGamma(a);
  let b = x + 1 - a;
  let c = 1 / 1e-300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - gln) * h;
}

/** Upper tail P(T > t) for Student t with df degrees of freedom. */
export function tUpper(t: number, df: number): number {
  const x = df / (df + t * t);
  const half = 0.5 * betaI(df / 2, 0.5, x);
  return t >= 0 ? half : 1 - half;
}

/** Upper tail P(X > x) for chi-square with df degrees of freedom. */
export function chiUpper(x: number, df: number): number {
  if (x <= 0) return 1;
  return upperGammaQ(df / 2, x / 2);
}

function upperTail(test: TestType, stat: number, df: number): number {
  if (test === "z") return normalUpper(stat);
  if (test === "t") return tUpper(stat, df);
  return chiUpper(stat, df);
}

function bisectCritical(test: TestType, df: number, tailProb: number): number {
  // find x such that upperTail(x) = tailProb
  let lo = test === "chi" ? 0 : -50;
  let hi = test === "chi" ? 1 + df * 20 + 200 : 50;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (upperTail(test, mid, df) > tailProb) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function formatP(p: number): string {
  if (p === 0) return "0";
  if (p < 0.0001) return p.toExponential(3);
  return p.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function fmt(n: number): string {
  return Number(n.toPrecision(5)).toString();
}

export function pValue(
  test: TestType,
  statRaw: string,
  dfRaw: string,
  tail: Tail,
  alphaRaw: string,
): PValueResult {
  const stat = parseNum(statRaw);
  if (stat === null) return { valid: false, error: "Enter a test statistic as a number." };
  const alpha = parseNum(alphaRaw);
  if (alpha === null || alpha <= 0 || alpha >= 1)
    return { valid: false, error: "Significance level (alpha) must be between 0 and 1, such as 0.05." };
  let df = 0;
  if (test !== "z") {
    const d = parseNum(dfRaw);
    if (d === null || d <= 0) return { valid: false, error: "Degrees of freedom must be a positive number." };
    df = d;
  }
  if (test === "chi") {
    if (stat < 0) return { valid: false, error: "A chi-square statistic cannot be negative." };
  }

  const upper = upperTail(test, stat, df);
  const cdf = 1 - upper;
  let p: number;
  let critical: string;
  if (test === "chi") {
    // chi-square is not symmetric: two-tailed = 2 * min(left, right)
    if (tail === "right") p = upper;
    else if (tail === "left") p = Math.max(0, 1 - upper);
    else p = Math.min(1, 2 * Math.min(upper, 1 - upper));
    if (tail === "right") critical = `critical value ${fmt(bisectCritical(test, df, alpha))}`;
    else if (tail === "left") critical = `critical value ${fmt(bisectCritical(test, df, 1 - alpha))}`;
    else
      critical = `critical values ${fmt(bisectCritical(test, df, 1 - alpha / 2))} and ${fmt(
        bisectCritical(test, df, alpha / 2),
      )}`;
  } else {
    if (tail === "right") p = upper;
    else if (tail === "left") p = 1 - upper;
    else p = Math.min(1, 2 * Math.min(upper, 1 - upper));
    if (tail === "two") {
      const c = bisectCritical(test, df, alpha / 2);
      critical = `critical values ±${fmt(c)}`;
    } else if (tail === "right") critical = `critical value ${fmt(bisectCritical(test, df, alpha))}`;
    else critical = `critical value ${fmt(-bisectCritical(test, df, alpha))}`;
  }
  if (p < 0) p = 0;
  const significant = p < alpha;
  const name = test === "z" ? "z" : test === "t" ? "t" : "chi-square";
  const tailName = tail === "two" ? "two-tailed" : tail === "right" ? "right-tailed" : "left-tailed";
  const decision = significant
    ? `p = ${formatP(p)} is less than alpha = ${alpha}. Reject the null hypothesis: the result is statistically significant.`
    : `p = ${formatP(p)} is not less than alpha = ${alpha}. Fail to reject the null hypothesis: the result is not statistically significant.`;
  const description = `${tailName} ${name} test, statistic ${fmt(stat)}${test === "z" ? "" : `, df ${fmt(df)}`}`;
  return { valid: true, p, pText: formatP(p), cdf, critical, alpha, significant, decision, description };
}
