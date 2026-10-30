export type ExponentMode = "power" | "base" | "exponent";

export type ExpNumber = {
  value: number;
  /** Exact fraction p/q when the input is a fraction, integer or terminating decimal. */
  num?: number;
  den?: number;
  text: string;
};

export type ExponentResult =
  | {
      valid: true;
      /** Finite JS number when it fits in double precision, otherwise null. */
      value: number | null;
      /** Main answer for display, e.g. "1,024" or "≈ 1.071508607 × 10³⁰¹" */
      answer: string;
      /** e.g. "1.024 × 10³" */
      scientific: string;
      /** e.g. "1.024E+3" */
      eNotation: string;
      /** Plain decimal form, or "" when too long to show. */
      standard: string;
      steps: string[];
      note?: string;
    }
  | { valid: false; error: string };

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "-": "⁻", ".": "·", "/": "ᐟ",
};

export function sup(s: string | number): string {
  return String(s)
    .split("")
    .map((ch) => SUP[ch] ?? ch)
    .join("");
}

function minus(s: string): string {
  return s.replace(/-/g, "−");
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function clean(raw: string): string {
  return raw.trim().replace(/[−–]/g, "-").replace(/,/g, "").replace(/\s+/g, "");
}

/** Parse "2", "-3", "0.5", "1.5e3", "1/2", "-2/3", "2^10" is not allowed. */
export function parseExpNumber(raw: string): ExpNumber | null {
  const t = clean(raw);
  if (t === "") return null;
  const frac = t.match(/^([+-]?\d+)\/([+-]?\d+)$/);
  if (frac) {
    let p = Number(frac[1]);
    let q = Number(frac[2]);
    if (q === 0) return null;
    if (q < 0) {
      p = -p;
      q = -q;
    }
    const g = gcd(p, q) || 1;
    p /= g;
    q /= g;
    return { value: p / q, num: p, den: q, text: q === 1 ? String(p) : `${p}/${q}` };
  }
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(t)) return null;
  const value = Number(t);
  if (!Number.isFinite(value)) return null;
  const out: ExpNumber = { value, text: String(value) };
  const dec = t.match(/^([+-]?)(\d*)\.?(\d*)$/);
  if (dec && dec[3].length <= 9) {
    const den0 = 10 ** dec[3].length;
    const num0 = Number(`${dec[2] || "0"}${dec[3]}`) * (dec[1] === "-" ? -1 : 1);
    if (Number.isSafeInteger(num0)) {
      const g = gcd(num0, den0) || 1;
      out.num = num0 / g;
      out.den = den0 / g;
    }
  } else if (Number.isInteger(value) && Number.isSafeInteger(value)) {
    out.num = value;
    out.den = 1;
  }
  return out;
}

function tidy(n: number, sig = 10): number {
  if (n === 0) return 0;
  const r = Number(n.toPrecision(sig));
  return Object.is(r, -0) ? 0 : r;
}

function groupThousands(s: string): string {
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  const [int, frac] = body.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "−" : "") + grouped + (frac ? `.${frac}` : "");
}

/** Plain decimal form (no e-notation) of a finite number. */
export function toStandard(n: number): string {
  if (n === 0) return "0";
  const sign = n < 0 ? "-" : "";
  const [mant, expStr] = Math.abs(n).toExponential().split("e");
  const exp = Number(expStr);
  const digits = mant.replace(".", "");
  let out: string;
  if (exp >= 0) {
    if (digits.length <= exp + 1) out = digits + "0".repeat(exp + 1 - digits.length);
    else out = `${digits.slice(0, exp + 1)}.${digits.slice(exp + 1)}`;
  } else {
    out = `0.${"0".repeat(-exp - 1)}${digits}`;
  }
  return sign + out;
}

function sciFromMantExp(mant: string, exp: number) {
  return {
    scientific: `${minus(mant)} × 10${sup(exp)}`,
    eNotation: `${minus(mant)}E${exp >= 0 ? "+" : "−"}${Math.abs(exp)}`,
  };
}

function sciFromNumber(v: number) {
  if (v === 0) return { scientific: "0 × 10⁰", eNotation: "0E+0" };
  const [mant, e] = tidy(v).toExponential().split("e");
  return sciFromMantExp(mant, Number(e));
}

/** Scientific notation from sign and log10 of the magnitude (for results beyond double range). */
function sciFromLog(sign: number, log10: number) {
  let exp = Math.floor(log10);
  let coef = tidy(10 ** (log10 - exp));
  if (coef >= 10) {
    coef = tidy(coef / 10);
    exp += 1;
  }
  return sciFromMantExp(`${sign < 0 ? "-" : ""}${coef}`, exp);
}

const MAX_STANDARD_DIGITS = 400;

function fmtNum(v: number): string {
  if (v !== 0 && (Math.abs(v) >= 1e21 || Math.abs(v) < 1e-6)) return sciFromNumber(v).scientific;
  return groupThousands(toStandard(tidy(v)));
}

function finite(value: number, steps: string[], note?: string): ExponentResult {
  const v = tidy(value);
  const { scientific, eNotation } = sciFromNumber(v);
  const standard = groupThousands(toStandard(v));
  const big = v !== 0 && (Math.abs(v) >= 1e21 || Math.abs(v) < 1e-6);
  return {
    valid: true,
    value: v,
    answer: big ? scientific : standard,
    scientific,
    eNotation,
    standard: standard.replace(/[^0-9]/g, "").length > MAX_STANDARD_DIGITS ? "" : standard,
    steps,
    note,
  };
}

function expText(e: ExpNumber): string {
  return e.den && e.den !== 1 && e.num !== undefined ? `${e.num}/${e.den}` : String(e.value);
}

function powText(base: number, e: ExpNumber): string {
  const b = base < 0 ? `(${minus(String(base))})` : String(base);
  const et = expText(e);
  return et.includes("/") || et.includes(".") ? `${b}^(${minus(et)})` : `${b}${sup(et)}`;
}

/** Raise base to an exponent (integer, negative, decimal or fraction). */
export function power(baseRaw: string, expRaw: string): ExponentResult {
  const b = parseExpNumber(baseRaw);
  const e = parseExpNumber(expRaw);
  if (!b) return { valid: false, error: "Enter a base like 2, −3, 0.5 or 1.5e3." };
  if (!e) return { valid: false, error: "Enter an exponent like 10, −2, 0.5 or 2/3." };
  const base = b.value;
  const n = e.value;
  const label = powText(base, e);
  const steps: string[] = [];

  if (base === 0) {
    if (n < 0) return { valid: false, error: "0 raised to a negative power is undefined (it would mean dividing by zero)." };
    if (n === 0) return finite(1, ["0⁰ is defined as 1 in most calculators and in algebra."], "0⁰ is usually taken to be 1.");
    return finite(0, [`0 raised to any positive power is 0, so ${label} = 0.`]);
  }
  if (n === 0) return finite(1, [`Any nonzero number to the power 0 is 1, so ${label} = 1.`]);

  let sign = 1;
  if (base < 0 && !Number.isInteger(n)) {
    if (e.num !== undefined && e.den !== undefined && e.den % 2 === 1) {
      sign = Math.abs(e.num) % 2 === 1 ? -1 : 1;
      steps.push(
        `The exponent ${minus(expText(e))} has an odd denominator (${e.den}), so the ${e.den}th root of a negative number is real and negative.`,
      );
    } else {
      return {
        valid: false,
        error: `${minus(label)} is not a real number: an even root (or irrational power) of a negative number is complex.`,
      };
    }
  } else if (base < 0) {
    sign = Math.abs(n) % 2 === 1 ? -1 : 1;
  }

  const absB = Math.abs(base);

  // Exact integer powers with BigInt when the result is too big for double precision.
  if (Number.isInteger(base) && Number.isInteger(n) && n > 0 && Math.abs(base) >= 2) {
    const digitsEst = n * Math.log10(absB);
    if (digitsEst > 15 && digitsEst < 5000) {
      const big = BigInt(base) ** BigInt(n);
      const s = big.toString();
      const neg = s.startsWith("-");
      const d = neg ? s.slice(1) : s;
      const mant = `${neg ? "-" : ""}${d[0]}${d.length > 1 ? "." + d.slice(1, 10).replace(/0+$/, "") : ""}`.replace(/\.$/, "");
      const { scientific, eNotation } = sciFromMantExp(mant, d.length - 1);
      steps.push(`Multiply ${minus(String(base))} by itself ${n} times.`);
      steps.push(`${label} has ${d.length} digits.`);
      steps.push(`${label} ≈ ${scientific}`);
      return {
        valid: true,
        value: Number.isFinite(Number(s)) ? Number(s) : null,
        answer: d.length > 21 ? scientific : groupThousands(s),
        scientific,
        eNotation,
        standard: d.length > MAX_STANDARD_DIGITS ? "" : groupThousands(s),
        steps,
        note: d.length > MAX_STANDARD_DIGITS ? `The exact answer has ${d.length} digits, so only scientific notation is shown.` : undefined,
      };
    }
  }

  // Explanation steps.
  if (Number.isInteger(n) && n > 0 && n <= 10) {
    const bt = base < 0 ? `(${minus(String(base))})` : String(base);
    steps.push(`${label} = ${Array(n).fill(bt).join(" × ")}`);
  } else if (Number.isInteger(n) && n < 0) {
    const pos: ExpNumber = { value: -n, num: -n, den: 1, text: String(-n) };
    steps.push(`A negative exponent means a reciprocal: ${label} = 1 / ${powText(base, pos)}.`);
  } else if (e.den && e.den > 1 && e.den <= 1000 && e.num !== undefined) {
    const root = e.den === 2 ? "square root" : e.den === 3 ? "cube root" : `${e.den}th root`;
    const absNum = Math.abs(e.num);
    steps.push(
      `A fractional exponent ${minus(`${e.num}/${e.den}`)} means: take the ${root} of ${minus(String(base))}${absNum !== 1 ? `, then raise it to the power ${absNum}` : ""}${e.num < 0 ? ", then take the reciprocal" : ""}.`,
    );
    const r = sign * Math.pow(absB, 1 / e.den);
    if (Number.isFinite(r) && r !== 0) steps.push(`The ${root} of ${minus(String(base))} ≈ ${minus(fmtNum(r))}.`);
  } else {
    steps.push(`Use logarithms: ${label} = 10^(${minus(String(n))} × log₁₀ ${minus(String(absB))}).`);
  }

  const log10 = n * Math.log10(absB);
  if (log10 > 307 || log10 < -307) {
    const { scientific, eNotation } = sciFromLog(sign, log10);
    steps.push(`log₁₀ of the answer = ${minus(String(n))} × log₁₀ ${minus(String(absB))} ≈ ${minus(tidy(log10).toString())}.`);
    steps.push(`${minus(label)} ≈ ${scientific}`);
    return {
      valid: true,
      value: null,
      answer: `≈ ${scientific}`,
      scientific,
      eNotation,
      standard: "",
      steps,
      note: "The answer is too large or too small to write out in full, so it is shown in scientific notation.",
    };
  }
  const value = sign * Math.pow(absB, n);
  steps.push(`${minus(label)} = ${minus(fmtNum(value))}`);
  return finite(value, steps);
}

/** Solve bˣ = r for x. */
export function solveExponent(baseRaw: string, resultRaw: string): ExponentResult {
  const b = parseExpNumber(baseRaw);
  const r = parseExpNumber(resultRaw);
  if (!b) return { valid: false, error: "Enter a base like 2, 10 or 0.5." };
  if (!r) return { valid: false, error: "Enter a result like 1024 or 0.125." };
  if (b.value <= 0 || b.value === 1) return { valid: false, error: "To solve for the exponent, the base must be positive and not equal to 1." };
  if (r.value <= 0) return { valid: false, error: "A positive base raised to any real power is positive, so the result must be greater than 0." };
  const x = Math.log(r.value) / Math.log(b.value);
  const xr = Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : x;
  const steps = [
    `Start with ${minus(String(b.value))}ˣ = ${minus(fmtNum(r.value))}.`,
    `Take the logarithm of both sides: x = log(${minus(fmtNum(r.value))}) / log(${minus(String(b.value))}).`,
    `x = ${minus(tidy(Math.log10(r.value)).toString())} / ${minus(tidy(Math.log10(b.value)).toString())} ≈ ${minus(fmtNum(xr))}`,
  ];
  return finite(xr, steps);
}

/** Solve xⁿ = r for x (real roots). */
export function solveBase(resultRaw: string, expRaw: string): ExponentResult {
  const r = parseExpNumber(resultRaw);
  const e = parseExpNumber(expRaw);
  if (!r) return { valid: false, error: "Enter a result like 81 or 0.25." };
  if (!e) return { valid: false, error: "Enter an exponent like 4, −2 or 1/2." };
  const n = e.value;
  if (n === 0) return { valid: false, error: "With an exponent of 0 every nonzero base gives 1, so the base can't be solved." };
  if (r.value === 0) {
    if (n < 0) return { valid: false, error: "No base raised to a negative power gives 0." };
    return finite(0, [`Only 0 raised to a positive power is 0, so x = 0.`]);
  }
  const steps = [`Start with xⁿ = ${minus(fmtNum(r.value))} where n = ${minus(expText(e))}.`, `Raise both sides to the power 1/n: x = ${minus(fmtNum(r.value))}^(1/${minus(expText(e))}).`];
  const isOddInt = Number.isInteger(n) && Math.abs(n) % 2 === 1;
  const isEvenInt = Number.isInteger(n) && Math.abs(n) % 2 === 0;
  if (r.value < 0) {
    if (!isOddInt) {
      return { valid: false, error: "A negative result needs an odd whole-number exponent; otherwise there is no real base." };
    }
    const x = -Math.pow(-r.value, 1 / n);
    steps.push(`x = ${minus(fmtNum(x))}`);
    return finite(x, steps);
  }
  const x = Math.pow(r.value, 1 / n);
  const xr = Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : x;
  steps.push(`x = ${minus(fmtNum(xr))}`);
  return finite(
    xr,
    steps,
    isEvenInt ? `Because the exponent is even, −${fmtNum(xr)} is also a solution: x = ±${fmtNum(xr)}.` : undefined,
  );
}
