export type Frac = { n: number; d: number };

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function norm(n: number, d: number): Frac {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

/** Parse an integer, decimal or fraction such as "-3", "0.75" or "2/3". */
export function parseRational(input: string): Frac | null {
  const s = input.trim().replace(/−/g, "-");
  if (!s) return null;
  const frac = /^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/.exec(s);
  if (frac) {
    const a = parseRational(frac[1]);
    const b = parseRational(frac[2]);
    if (!a || !b || b.n === 0) return null;
    return norm(a.n * b.d, a.d * b.n);
  }
  const dec = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(s);
  if (!dec) return null;
  const decimals = dec[3] ?? "";
  if (decimals.length > 9 || dec[2].length > 12) return null;
  const d = 10 ** decimals.length;
  const n = Number(dec[2] + decimals) * (dec[1] === "-" ? -1 : 1);
  return norm(n, d);
}

const mul = (a: Frac, b: Frac) => norm(a.n * b.n, a.d * b.d);
const sub = (a: Frac, b: Frac) => norm(a.n * b.d - b.n * a.d, a.d * b.d);
const neg = (a: Frac): Frac => ({ n: -a.n, d: a.d });

export type StandardFormResult =
  | { valid: true; a: number; b: number; c: number; equation: string; steps: string[] }
  | { valid: false; error: string };

function lcm(a: number, b: number) {
  return (a / gcd(a, b)) * b;
}

function term(coef: number, variable: string, first: boolean): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  const body = `${abs === 1 ? "" : abs}${variable}`;
  if (first) return coef < 0 ? `−${body}` : body;
  return coef < 0 ? ` − ${body}` : ` + ${body}`;
}

export function formatEquation(a: number, b: number, c: number): string {
  const left = term(a, "x", true) + term(b, "y", a === 0);
  return `${left || "0"} = ${c < 0 ? `−${Math.abs(c)}` : c}`;
}

function fracText(f: Frac): string {
  const v = f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
  return v.replace("-", "−");
}

/** Turn A x + B y = C (rational coefficients) into integer standard form with A >= 0. */
export function toIntegerStandard(a: Frac, b: Frac, c: Frac): StandardFormResult {
  if (a.n === 0 && b.n === 0) return { valid: false, error: "A and B cannot both be zero." };
  const steps: string[] = [];
  const m = lcm(lcm(a.d, b.d), c.d);
  let A = (a.n * m) / a.d;
  let B = (b.n * m) / b.d;
  let C = (c.n * m) / c.d;
  if (m !== 1) steps.push(`Multiply every term by ${m} to clear the fractions: ${A}x + ${B}y = ${C}.`.replace(/-/g, "−"));
  const g = gcd(gcd(A, B), C) || 1;
  if (g !== 1) {
    A /= g;
    B /= g;
    C /= g;
    steps.push(`Divide every term by the greatest common factor ${g}.`);
  }
  if (A < 0 || (A === 0 && B < 0)) {
    A = -A;
    B = -B;
    C = -C;
    steps.push("Multiply by −1 so the x coefficient A is not negative.");
  }
  A += 0;
  B += 0;
  C += 0;
  return { valid: true, a: A, b: B, c: C, equation: formatEquation(A, B, C), steps };
}

export function fromSlopeIntercept(mText: string, bText: string): StandardFormResult {
  const m = parseRational(mText);
  const b = parseRational(bText);
  if (!m || !b) return { valid: false, error: "Enter the slope m and the y-intercept b as numbers or fractions." };
  const res = toIntegerStandard(neg(m), { n: 1, d: 1 }, b);
  if (!res.valid) return res;
  return {
    ...res,
    steps: [`Start with y = ${fracText(m)}x + ${fracText(b)}.`.replace("+ −", "− "), `Move the x term to the left: ${fracText(neg(m))}x + y = ${fracText(b)}.`, ...res.steps],
  };
}

export function fromPointSlope(mText: string, xText: string, yText: string): StandardFormResult {
  const m = parseRational(mText);
  const x1 = parseRational(xText);
  const y1 = parseRational(yText);
  if (!m || !x1 || !y1) return { valid: false, error: "Enter the slope m and the point (x₁, y₁) as numbers or fractions." };
  const c = sub(y1, mul(m, x1));
  const res = toIntegerStandard(neg(m), { n: 1, d: 1 }, c);
  if (!res.valid) return res;
  return {
    ...res,
    steps: [
      `Start with y − (${fracText(y1)}) = ${fracText(m)}(x − (${fracText(x1)})).`,
      `Expand and collect: ${fracText(neg(m))}x + y = ${fracText(c)}.`,
      ...res.steps,
    ],
  };
}

export type SciStandardResult =
  | { valid: true; coefficient: string; exponent: number; text: string; ordinary: string }
  | { valid: false; error: string };

/** Ordinary number to "standard form" (a × 10^n with 1 <= a < 10). */
export function numberToStandardForm(input: string): SciStandardResult {
  const s = input.trim().replace(/,/g, "").replace(/−/g, "-");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return { valid: false, error: "Enter an ordinary number such as 45000 or 0.00032." };
  const v = Number(s);
  if (!Number.isFinite(v)) return { valid: false, error: "That number is too large." };
  if (v === 0) return { valid: true, coefficient: "0", exponent: 0, text: "0 × 10⁰", ordinary: "0" };
  const [coef, exp] = v.toExponential().split("e");
  const e = Number(exp);
  const sup = String(e)
    .split("")
    .map((ch) => ({ "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" })[ch] ?? ch)
    .join("");
  return { valid: true, coefficient: coef, exponent: e, text: `${coef} × 10${sup}`, ordinary: s.replace(/^\+/, "") };
}
