export type RootMode = "square" | "cube";

export type RootResult =
  | {
      valid: true;
      mode: RootMode;
      input: number;
      /** Decimal value as text, e.g. "8.485281374" or "8.485281374i". */
      decimalText: string;
      /** Real part of the decimal answer (or the magnitude of the imaginary answer). */
      decimal: number;
      imaginary: boolean;
      /** Simplified radical, e.g. "6√2", "6√2 i", "−2∛2". Null for non-integers or very large inputs. */
      radicalText: string | null;
      outside: number | null;
      inside: number | null;
      perfect: boolean;
      steps: string[];
    }
  | { valid: false; error: string };

const MAX_SIMPLIFY = 1e12;

function clean(n: number): number {
  const r = Math.round(n * 1e10) / 1e10;
  return Object.is(r, -0) ? 0 : r;
}

export function formatNumber(n: number): string {
  const v = clean(n);
  if (Number.isInteger(v)) return v.toString();
  return Number(v.toPrecision(10)).toString();
}

function parse(raw: string): number | null {
  const t = raw.trim().replace(/−/g, "-").replace(/,/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Split n (a positive integer) into outside^power × inside with inside free of power-th powers. */
export function extractPower(n: number, power: 2 | 3): { outside: number; inside: number } {
  let outside = 1;
  let inside = 1;
  let rest = n;
  for (let p = 2; p * p <= rest; p += p === 2 ? 1 : 2) {
    let count = 0;
    while (rest % p === 0) {
      rest /= p;
      count += 1;
    }
    if (count > 0) {
      outside *= p ** Math.floor(count / power);
      inside *= p ** (count % power);
    }
  }
  if (rest > 1) inside *= rest;
  return { outside, inside };
}

function radical(outside: number, inside: number, symbol: string): string {
  if (inside === 1) return outside.toString();
  if (outside === 1) return `${symbol}${inside}`;
  return `${outside}${symbol}${inside}`;
}

export function computeRoot(raw: string, mode: RootMode = "square"): RootResult {
  const n = parse(raw);
  if (n === null) return { valid: false, error: "Enter a number, like 72 or −27." };
  const symbol = mode === "square" ? "√" : "∛";
  const label = mode === "square" ? "square root" : "cube root";
  const isInt = Number.isInteger(n) && Math.abs(n) <= MAX_SIMPLIFY;
  const steps: string[] = [];

  if (mode === "square") {
    const imaginary = n < 0;
    const mag = Math.sqrt(Math.abs(n));
    const decimalText = imaginary ? `${formatNumber(mag)}i` : formatNumber(mag);
    let radicalText: string | null = null;
    let outside: number | null = null;
    let inside: number | null = null;
    let perfect = false;
    if (imaginary) {
      steps.push(`√${formatNumber(n).replace("-", "−")} = √${formatNumber(-n)} × √−1 = √${formatNumber(-n)} × i`);
    }
    if (isInt) {
      const abs = Math.abs(n);
      if (abs === 0) {
        outside = 0;
        inside = 1;
        perfect = true;
        radicalText = "0";
      } else {
        ({ outside, inside } = extractPower(abs, 2));
        perfect = inside === 1;
        const base = radical(outside, inside, "√");
        if (outside > 1 && inside > 1) {
          steps.push(`${abs} = ${outside * outside} × ${inside} = ${outside}² × ${inside}`);
          steps.push(`√${abs} = √${outside * outside} × √${inside} = ${outside}√${inside}`);
        } else if (perfect) {
          steps.push(`${abs} = ${outside}², so √${abs} = ${outside} (a perfect square)`);
        } else {
          steps.push(`${abs} has no square factor other than 1, so √${abs} is already simplified`);
        }
        radicalText = imaginary ? (base === "1" ? "i" : inside === 1 ? `${base}i` : `${base} i`) : base;
      }
    } else {
      steps.push(`${formatNumber(Math.abs(n))} is not a whole number, so only the decimal ${label} is shown`);
    }
    steps.push(`${symbol}${formatNumber(n).replace("-", "−")} ≈ ${decimalText}`);
    return { valid: true, mode, input: n, decimalText, decimal: mag, imaginary, radicalText, outside, inside, perfect, steps };
  }

  // Cube root: real for every real number, including negatives.
  const value = Math.cbrt(n);
  const decimalText = formatNumber(value).replace(/^-/, "−");
  let radicalText: string | null = null;
  let outside: number | null = null;
  let inside: number | null = null;
  let perfect = false;
  if (isInt) {
    const abs = Math.abs(n);
    const sign = n < 0 ? "−" : "";
    if (abs === 0) {
      outside = 0;
      inside = 1;
      perfect = true;
      radicalText = "0";
    } else {
      ({ outside, inside } = extractPower(abs, 3));
      perfect = inside === 1;
      if (n < 0) steps.push(`∛−${abs} = −∛${abs}, because a negative number times itself three times stays negative`);
      if (outside > 1 && inside > 1) {
        steps.push(`${abs} = ${outside ** 3} × ${inside} = ${outside}³ × ${inside}`);
        steps.push(`∛${abs} = ∛${outside ** 3} × ∛${inside} = ${outside}∛${inside}`);
      } else if (perfect) {
        steps.push(`${abs} = ${outside}³, so ∛${abs} = ${outside} (a perfect cube)`);
      } else {
        steps.push(`${abs} has no cube factor other than 1, so ∛${abs} is already simplified`);
      }
      radicalText = `${sign}${radical(outside, inside, "∛")}`;
      if (n < 0) outside = -outside;
    }
  } else {
    steps.push(`${formatNumber(Math.abs(n))} is not a whole number, so only the decimal ${label} is shown`);
  }
  steps.push(`∛${formatNumber(n).replace("-", "−")} ≈ ${decimalText}`);
  return { valid: true, mode, input: n, decimalText, decimal: value, imaginary: false, radicalText, outside, inside, perfect, steps };
}
