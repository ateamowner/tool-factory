export type LogMode = "log" | "antilog";

export type LogResult =
  | { valid: false; error: string }
  | {
      valid: true;
      answer: string;
      value: number;
      scientific: string;
      ln: string;
      log10: string;
      steps: string[];
    };

const minus = (s: string) => s.replace(/^-/, "−");

/** Parse "10", "-2.5", "1/3", "e", "2e3" into a number. Returns null if invalid. */
export function parseNumber(raw: unknown): number | null {
  const t = (raw === null || raw === undefined ? "" : String(raw)).trim().replace(/^\+/, "").replace(/\s+/g, "");
  if (t === "") return null;
  if (/^e$/i.test(t)) return Math.E;
  if (/^-e$/i.test(t)) return -Math.E;
  const slash = t.match(/^(-?[\d.]+(?:e[+-]?\d+)?)\/(-?[\d.]+(?:e[+-]?\d+)?)$/i);
  if (slash) {
    const a = parseNumber(slash[1]);
    const b = parseNumber(slash[2]);
    if (a === null || b === null || b === 0) return null;
    return a / b;
  }
  if (!/^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Format to at most 10 significant digits without trailing zeros. */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return minus(sci(n));
  const r = Number(n.toPrecision(10));
  return minus(String(Object.is(r, -0) ? 0 : r));
}

export function sci(n: number): string {
  if (n === 0) return "0";
  const [m, e] = n.toExponential(9).split("e");
  const mant = String(Number(m));
  return `${mant} × 10^${Number(e)}`;
}

const baseLabel = (b: number, raw: string) => (/^e$/i.test(raw.trim()) ? "e" : fmt(b));

function checkBase(b: number | null): string | null {
  if (b === null) return "Enter a base like 10, e, 2 or 1.5.";
  if (b <= 0 || b === 1) return "The base must be positive and not equal to 1.";
  return null;
}

/** log base b of x, with change-of-base steps. */
export function logarithm(xRaw: unknown, bRaw: unknown): LogResult {
  const x = parseNumber(xRaw);
  const b = parseNumber(bRaw);
  if (x === null) return { valid: false, error: "Enter a number like 100, 0.001 or 2/3." };
  const bad = checkBase(b);
  if (bad || b === null) return { valid: false, error: bad ?? "" };
  if (x <= 0) return { valid: false, error: "The logarithm is only defined for positive numbers. Enter a number greater than 0." };

  const bl = baseLabel(b, String(bRaw));
  const lnx = Math.log(x);
  const lnb = Math.log(b);
  const value = bl === "e" ? lnx : b === 10 ? Math.log10(x) : lnx / lnb;
  const steps: string[] = [];
  const xs = fmt(x);
  if (bl === "e") {
    steps.push(`Base e is the natural log: log_e(${xs}) = ln(${xs}).`);
    steps.push(`ln(${xs}) = ${fmt(lnx)}.`);
  } else if (b === 10) {
    steps.push(`Base 10 is the common log: log₁₀(${xs}) = log(${xs}).`);
    steps.push(`log(${xs}) = ${fmt(value)}.`);
  } else {
    steps.push(`Change of base: log_${bl}(x) = ln(x) / ln(${bl}).`);
    steps.push(`ln(${xs}) = ${fmt(lnx)} and ln(${bl}) = ${fmt(lnb)}.`);
    steps.push(`log_${bl}(${xs}) = ${fmt(lnx)} / ${fmt(lnb)} = ${fmt(value)}.`);
    steps.push(`Same thing with common logs: log(${xs}) / log(${bl}) = ${fmt(Math.log10(x))} / ${fmt(Math.log10(b))} = ${fmt(value)}.`);
  }
  const rounded = Number(value.toPrecision(12));
  if (Number.isInteger(rounded)) steps.push(`Check: ${bl}^${fmt(rounded)} = ${xs}.`);
  else steps.push(`Check: ${bl}^${fmt(value)} ≈ ${xs}.`);

  return {
    valid: true,
    answer: fmt(Number.isInteger(rounded) ? rounded : value),
    value,
    scientific: sci(value),
    ln: fmt(lnx),
    log10: fmt(Math.log10(x)),
    steps,
  };
}

/** Antilog: b^y. */
export function antilog(yRaw: unknown, bRaw: unknown): LogResult {
  const y = parseNumber(yRaw);
  const b = parseNumber(bRaw);
  if (y === null) return { valid: false, error: "Enter a log value like 2, −1.5 or 0.301." };
  const bad = checkBase(b);
  if (bad || b === null) return { valid: false, error: bad ?? "" };
  const bl = baseLabel(b, String(bRaw));
  const value = bl === "e" ? Math.exp(y) : b === 10 ? Math.pow(10, y) : Math.pow(b, y);
  if (!Number.isFinite(value)) return { valid: false, error: "That result is too large to display. Try a smaller log value." };
  const ys = fmt(y);
  const steps = [
    `The antilog undoes the log: if log_${bl}(x) = ${ys}, then x = ${bl}^${ys}.`,
    bl === "e"
      ? `e^${ys} = ${fmt(value)}.`
      : `${bl}^${ys} = ${fmt(value)}.`,
  ];
  if (bl !== "e" && b !== 10) {
    steps.push(`Using natural logs: ${bl}^${ys} = e^(${ys} × ln ${bl}) = e^(${ys} × ${fmt(Math.log(b))}) = ${fmt(value)}.`);
  }
  steps.push(`Check: log_${bl}(${fmt(value)}) = ${ys}.`);
  return {
    valid: true,
    answer: fmt(value),
    value,
    scientific: sci(value),
    ln: value > 0 ? fmt(Math.log(value)) : "undefined",
    log10: value > 0 ? fmt(Math.log10(value)) : "undefined",
    steps,
  };
}
