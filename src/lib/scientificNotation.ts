export type SciOp = "add" | "subtract" | "multiply" | "divide";

export type SciParts = {
  value: number;
  /** Coefficient with 1 ≤ |c| < 10 (0 for zero). */
  coefficient: number;
  exponent: number;
  /** e.g. "1.23 × 10⁵" */
  scientific: string;
  /** e.g. "1.23E+5" */
  eNotation: string;
  /** e.g. "123000" (never uses e-notation) */
  standard: string;
  /** e.g. "123 × 10³" (exponent a multiple of 3) */
  engineering: string;
  significantFigures: number;
};

export type ConvertResult = ({ valid: true; steps: string[] } & SciParts) | { valid: false; error: string };

export type OperateResult =
  | ({ valid: true; steps: string[]; a: SciParts; b: SciParts } & SciParts)
  | { valid: false; error: string };

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
};

export function superscript(n: number): string {
  return n
    .toString()
    .split("")
    .map((ch) => SUPERSCRIPT[ch] ?? ch)
    .join("");
}

/**
 * Parse standard numbers ("123,000", "0.00045") and scientific forms
 * ("1.23e5", "1.23E-5", "1.23 x 10^5", "1.23×10^-5", "1.23*10^5", "10^5").
 */
export function parseScientific(raw: string): number | null {
  let t = raw.trim().replace(/[−–]/g, "-").replace(/,/g, "").replace(/\s+/g, "");
  if (t === "") return null;
  t = t.replace(/\^\(([^)]*)\)/g, "^$1");
  const m = t.match(/^([+-]?(?:\d+\.?\d*|\.\d+))?(?:[x×*·⋅])?10\^([+-]?\d+)$/i);
  if (m) {
    const coef = m[1] === undefined ? 1 : Number(m[1]);
    const exp = Number(m[2]);
    const n = Number(`${coef}e${exp}`);
    return Number.isFinite(n) ? n : null;
  }
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Write a number in plain decimal form without e-notation. */
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

function groupThousands(s: string): string {
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  const [int, frac] = body.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "−" : "") + grouped + (frac ? `.${frac}` : "");
}

export function formatStandard(n: number): string {
  return groupThousands(toStandard(n));
}

function minus(s: string): string {
  return s.replace(/-/g, "−");
}

/** Round to at most `sig` significant figures to clear floating-point noise. */
function tidy(n: number, sig = 10): number {
  if (n === 0) return 0;
  const r = Number(n.toPrecision(sig));
  return Object.is(r, -0) ? 0 : r;
}

export function toParts(value: number, sigFigs?: number): SciParts {
  const v = sigFigs ? Number(value.toPrecision(sigFigs)) : tidy(value);
  if (v === 0) {
    return {
      value: 0,
      coefficient: 0,
      exponent: 0,
      scientific: "0 × 10⁰",
      eNotation: "0E+0",
      standard: "0",
      engineering: "0 × 10⁰",
      significantFigures: 1,
    };
  }
  const expStr = sigFigs ? v.toExponential(sigFigs - 1) : v.toExponential();
  const [mant, e] = expStr.split("e");
  const exponent = Number(e);
  const coefficient = Number(mant);
  const engExp = Math.floor(exponent / 3) * 3;
  const engCoef = tidy(coefficient * 10 ** (exponent - engExp));
  const significantFigures = mant.replace("-", "").replace(".", "").length;
  return {
    value: v,
    coefficient,
    exponent,
    scientific: `${minus(mant)} × 10${superscript(exponent)}`,
    eNotation: `${minus(mant)}E${exponent >= 0 ? "+" : "−"}${Math.abs(exponent)}`,
    standard: formatStandard(v),
    engineering: `${minus(sigFigs ? engCoef.toPrecision(sigFigs) : engCoef.toString())} × 10${superscript(engExp)}`,
    significantFigures,
  };
}

export function convertNumber(raw: string, sigFigs?: number): ConvertResult {
  const n = parseScientific(raw);
  if (n === null) {
    return { valid: false, error: "Enter a number like 123000, 0.00045, 1.23e5, or 1.23 × 10^5." };
  }
  const parts = toParts(n, sigFigs);
  const steps: string[] = [];
  if (parts.value === 0) {
    steps.push("Zero is written as 0 × 10⁰.");
  } else {
    const places = Math.abs(parts.exponent);
    const dir = parts.exponent > 0 ? "left" : "right";
    steps.push(`Start with ${parts.standard}.`);
    if (places === 0) {
      steps.push("The number is already between 1 and 10, so the exponent is 0.");
    } else {
      steps.push(
        `Move the decimal point ${places} place${places === 1 ? "" : "s"} to the ${dir} to get ${minus(String(parts.coefficient))}, a number between 1 and 10.`,
      );
      steps.push(
        `Moving ${dir} ${places} place${places === 1 ? "" : "s"} gives an exponent of ${minus(String(parts.exponent))}.`,
      );
    }
    steps.push(`${parts.standard} = ${parts.scientific} = ${parts.eNotation}`);
  }
  return { valid: true, steps, ...parts };
}

const OP_SYMBOL: Record<SciOp, string> = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

export function operate(rawA: string, rawB: string, op: SciOp): OperateResult {
  const x = parseScientific(rawA);
  const y = parseScientific(rawB);
  if (x === null || y === null) {
    return { valid: false, error: "Enter two numbers, like 3.2 × 10^4 and 1.5e3." };
  }
  if (op === "divide" && y === 0) return { valid: false, error: "You can't divide by zero." };
  const a = toParts(x);
  const b = toParts(y);
  const steps: string[] = [];
  let raw: number;
  if (op === "multiply") {
    const c = tidy(a.coefficient * b.coefficient);
    const e = a.exponent + b.exponent;
    steps.push(`Multiply the coefficients: ${minus(String(a.coefficient))} × ${minus(String(b.coefficient))} = ${minus(String(c))}`);
    steps.push(`Add the exponents: ${minus(String(a.exponent))} + ${minus(String(b.exponent))} = ${minus(String(e))}`);
    steps.push(`Combine: ${minus(String(c))} × 10${superscript(e)}`);
    raw = x * y;
  } else if (op === "divide") {
    const c = tidy(a.coefficient / b.coefficient);
    const e = a.exponent - b.exponent;
    steps.push(`Divide the coefficients: ${minus(String(a.coefficient))} ÷ ${minus(String(b.coefficient))} = ${minus(String(c))}`);
    steps.push(`Subtract the exponents: ${minus(String(a.exponent))} − ${minus(String(b.exponent))} = ${minus(String(e))}`);
    steps.push(`Combine: ${minus(String(c))} × 10${superscript(e)}`);
    raw = x / y;
  } else {
    const e = Math.max(a.exponent, b.exponent);
    const ca = tidy(a.value / 10 ** e);
    const cb = tidy(b.value / 10 ** e);
    const c = op === "add" ? tidy(ca + cb) : tidy(ca - cb);
    steps.push(`Rewrite both numbers with the larger exponent, 10${superscript(e)}: ${minus(String(ca))} × 10${superscript(e)} and ${minus(String(cb))} × 10${superscript(e)}`);
    steps.push(`${op === "add" ? "Add" : "Subtract"} the coefficients: ${minus(String(ca))} ${OP_SYMBOL[op]} ${minus(String(cb))} = ${minus(String(c))}`);
    steps.push(`Combine: ${minus(String(c))} × 10${superscript(e)}`);
    raw = op === "add" ? x + y : x - y;
  }
  const result = toParts(raw);
  steps.push(`Normalize so the coefficient is between 1 and 10: ${result.scientific}`);
  return { valid: true, steps, a, b, ...result };
}
