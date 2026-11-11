// Exact rational arithmetic (BigInt) so fractions like 7/3 stay exact.
export type Frac = { n: bigint; d: bigint };

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

function frac(n: bigint, d: bigint = 1n): Frac {
  if (d === 0n) throw new Error("division by zero");
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}

const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);
const neg = (a: Frac) => frac(-a.n, a.d);
const isZero = (a: Frac) => a.n === 0n;
const isOne = (a: Frac) => a.n === 1n && a.d === 1n;

/** Parse "3", "-2.5", "1/3", ".5". Returns null if not a number. */
export function parseFrac(raw: unknown): Frac | null {
  const t = (raw === null || raw === undefined ? "" : String(raw)).trim().replace(/^\+/, "");
  if (t === "") return null;
  const slash = t.match(/^(-?\d+(?:\.\d+)?|-?\.\d+)\s*\/\s*(-?\d+(?:\.\d+)?|-?\.\d+)$/);
  if (slash) {
    const a = parseFrac(slash[1]);
    const b = parseFrac(slash[2]);
    if (!a || !b || isZero(b)) return null;
    return div(a, b);
  }
  const m = t.match(/^(-?)(\d*)(?:\.(\d+))?$/);
  if (!m || (m[2] === "" && m[3] === undefined)) return null;
  const digits = (m[2] || "0") + (m[3] ?? "");
  if (digits.length > 30) return null;
  const scale = 10n ** BigInt((m[3] ?? "").length);
  const n = BigInt(digits) * (m[1] ? -1n : 1n);
  return frac(n, scale);
}

export function fracToString(a: Frac): string {
  return a.d === 1n ? a.n.toString() : `${a.n}/${a.d}`;
}

export function fracToNumber(a: Frac): number {
  return Number(a.n) / Number(a.d);
}

export function fracToDecimal(a: Frac, digits = 6): string {
  const v = fracToNumber(a);
  const r = Number(v.toFixed(digits));
  return (Object.is(r, -0) ? 0 : r).toString();
}

/** "7/3 ≈ 2.333333" for non-integers, "5" for integers. */
export function fracDisplay(a: Frac): string {
  return a.d === 1n ? a.n.toString() : `${fracToString(a)} ≈ ${fracToDecimal(a)}`;
}

const NAMES = ["x", "y", "z"];

function term(c: Frac, name: string, first: boolean): string {
  const negative = c.n < 0n;
  const abs = negative ? neg(c) : c;
  const body = isOne(abs) ? name : `${abs.d === 1n ? abs.n : `(${fracToString(abs)})`}${name}`;
  if (first) return negative ? `−${body}` : body;
  return ` ${negative ? "−" : "+"} ${body}`;
}

export function formatEquation(row: Frac[], names: string[]): string {
  const k = names.length;
  let left = "";
  let first = true;
  for (let i = 0; i < k; i++) {
    if (isZero(row[i])) continue;
    left += term(row[i], names[i], first);
    first = false;
  }
  if (first) left = "0";
  const rhs = fracToString(row[k]).replace("-", "−");
  return `${left} = ${rhs}`;
}

const f = (a: Frac) => fracToString(a).replace("-", "−");

export type SystemResult =
  | {
      valid: true;
      size: number;
      names: string[];
      status: "unique" | "none" | "infinite";
      solution: Frac[];
      determinant: Frac;
      equations: string[];
      eliminationSteps: string[];
      substitutionSteps: string[];
      summary: string;
    }
  | { valid: false; error: string };

function det(m: Frac[][]): Frac {
  const n = m.length;
  const a = m.map((r) => r.slice());
  let d = frac(1n);
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && isZero(a[p][c])) p++;
    if (p === n) return frac(0n);
    if (p !== c) {
      [a[p], a[c]] = [a[c], a[p]];
      d = neg(d);
    }
    d = mul(d, a[c][c]);
    for (let r = c + 1; r < n; r++) {
      const k = div(a[r][c], a[c][c]);
      for (let j = c; j < n; j++) a[r][j] = sub(a[r][j], mul(k, a[c][j]));
    }
  }
  return d;
}

function rowLabel(i: number): string {
  return `R${i + 1}`;
}

/** Gauss-Jordan elimination written out as row operations. */
function eliminate(rows: Frac[][], names: string[]): { steps: string[]; status: "unique" | "none" | "infinite"; solution: Frac[] } {
  const n = names.length;
  const a = rows.map((r) => r.slice());
  const steps: string[] = [];
  const show = () => a.map((r, i) => `${rowLabel(i)}: ${formatEquation(r, names)}`).join("   |   ");
  steps.push(`Start: ${show()}`);
  let pivotRow = 0;
  const pivotCols: number[] = [];
  for (let c = 0; c < n && pivotRow < n; c++) {
    let p = pivotRow;
    while (p < n && isZero(a[p][c])) p++;
    if (p === n) {
      steps.push(`No equation below has ${names[c]} in it, so ${names[c]} is a free variable.`);
      continue;
    }
    if (p !== pivotRow) {
      [a[p], a[pivotRow]] = [a[pivotRow], a[p]];
      steps.push(`Swap ${rowLabel(p)} and ${rowLabel(pivotRow)} so ${names[c]} has a nonzero coefficient: ${show()}`);
    }
    const lead = a[pivotRow][c];
    if (!isOne(lead)) {
      a[pivotRow] = a[pivotRow].map((v) => div(v, lead));
      steps.push(`Divide ${rowLabel(pivotRow)} by ${f(lead)} to make the ${names[c]} coefficient 1: ${rowLabel(pivotRow)}: ${formatEquation(a[pivotRow], names)}`);
    }
    for (let r = 0; r < n; r++) {
      if (r === pivotRow || isZero(a[r][c])) continue;
      const k = a[r][c];
      a[r] = a[r].map((v, j) => sub(v, mul(k, a[pivotRow][j])));
      const op = k.n > 0n ? `${rowLabel(r)} − ${isOne(k) ? "" : `${f(k)} × `}${rowLabel(pivotRow)}` : `${rowLabel(r)} + ${isOne(neg(k)) ? "" : `${f(neg(k))} × `}${rowLabel(pivotRow)}`;
      steps.push(`Eliminate ${names[c]} from ${rowLabel(r)}: ${op} → ${rowLabel(r)}: ${formatEquation(a[r], names)}`);
    }
    pivotCols.push(c);
    pivotRow++;
  }
  for (let r = 0; r < n; r++) {
    const allZero = a[r].slice(0, n).every(isZero);
    if (allZero && !isZero(a[r][n])) {
      steps.push(`${rowLabel(r)} reads 0 = ${f(a[r][n])}, which is false, so the equations contradict each other and there is no solution.`);
      return { steps, status: "none", solution: [] };
    }
  }
  if (pivotCols.length < n) {
    steps.push("An equation reduced to 0 = 0, so at least one equation is redundant and there are infinitely many solutions.");
    return { steps, status: "infinite", solution: [] };
  }
  const solution = names.map((_, i) => a[i][n]);
  steps.push(`Read off the answer: ${names.map((nm, i) => `${nm} = ${f(solution[i])}`).join(", ")}`);
  return { steps, status: "unique", solution };
}

/** Substitution: solve one equation for a variable, plug into the rest, repeat, then back-substitute. */
function substitute(rows: Frac[][], names: string[]): string[] {
  const steps: string[] = [];
  const known: { name: string; expr: Frac[]; vars: string[] }[] = [];
  let cur = rows.map((r) => r.slice());
  let vars = names.slice();
  steps.push(
    `Start: ${cur.map((r, i) => `(${i + 1}) ${formatEquation(r, vars)}`).join("   |   ")}`,
  );
  let stage = 1;
  while (vars.length > 0) {
    // Find an equation and variable to solve for (prefer coefficient ±1).
    let pr = -1;
    let pc = -1;
    let bestScore = -1;
    for (let r = 0; r < cur.length; r++) {
      for (let c = 0; c < vars.length; c++) {
        const v = cur[r][c];
        if (isZero(v)) continue;
        const score = (isOne(v) || isOne(neg(v)) ? 2 : 1) * 10 - r;
        if (score > bestScore) {
          bestScore = score;
          pr = r;
          pc = c;
        }
      }
    }
    if (pr === -1) {
      const bad = cur.find((r) => !isZero(r[vars.length]));
      steps.push(
        bad
          ? `Every variable cancelled and we are left with 0 = ${f(bad[vars.length])}, which is false, so there is no solution.`
          : `Every variable cancelled and we are left with 0 = 0, which is always true, so there are infinitely many solutions.`,
      );
      return steps;
    }
    const v = vars[pc];
    const row = cur[pr];
    const a = row[pc];
    const rest = vars.filter((_, i) => i !== pc);
    // v = (c - sum others) / a  => expr over rest: coefficients then constant
    const expr = [...rest.map((_, i) => {
      const idx = i < pc ? i : i + 1;
      return neg(div(row[idx], a));
    }), div(row[vars.length], a)];
    const exprText = formatExpr(expr, rest);
    steps.push(`Step ${stage}: solve equation (${pr + 1}) for ${v}: ${v} = ${exprText}`);
    known.push({ name: v, expr, vars: rest });
    const next: Frac[][] = [];
    cur.forEach((r, i) => {
      if (i === pr) return;
      const k = r[pc];
      const out = rest.map((_, j) => {
        const idx = j < pc ? j : j + 1;
        return add(r[idx], mul(k, expr[j]));
      });
      // r: sum_{others} r_j x_j + k v = c  ->  sum (r_j + k e_j) x_j = c - k e_const
      const cst = sub(r[vars.length], mul(k, expr[rest.length]));
      next.push([...out, cst]);
      if (!isZero(k)) {
        steps.push(
          `Substitute into equation (${i + 1}): ${formatEquation(r, vars)} becomes ${formatEquation([...out, cst], rest)}`,
        );
      }
    });
    cur = next;
    vars = rest;
    stage++;
    if (vars.length === 0) {
      const bad = cur.find((r) => !isZero(r[0]));
      if (bad) {
        steps.push(`The leftover equation reads 0 = ${f(bad[0])}, which is false, so there is no solution.`);
        return steps;
      }
      break;
    }
    if (cur.length === 0) {
      steps.push("No equations are left to pin down the remaining variables, so there are infinitely many solutions.");
      return steps;
    }
    // Single-variable equation: solve directly in the next loop iteration (coefficient handled above).
  }
  // Back-substitute.
  const values: Record<string, Frac> = {};
  for (let i = known.length - 1; i >= 0; i--) {
    const k = known[i];
    let val = k.expr[k.vars.length];
    k.vars.forEach((vn, j) => {
      val = add(val, mul(k.expr[j], values[vn]));
    });
    values[k.name] = val;
    const used = k.vars.length ? ` using ${k.vars.map((vn) => `${vn} = ${f(values[vn])}`).join(", ")}` : "";
    steps.push(`Back-substitute${used}: ${k.name} = ${f(val)}`);
  }
  steps.push(`Answer: ${names.map((nm) => `${nm} = ${f(values[nm])}`).join(", ")}`);
  return steps;
}

function formatExpr(expr: Frac[], vars: string[]): string {
  let out = "";
  let first = true;
  const cst = expr[vars.length];
  if (!isZero(cst)) {
    out += f(cst);
    first = false;
  }
  vars.forEach((vn, i) => {
    if (isZero(expr[i])) return;
    out += term(expr[i], vn, first);
    first = false;
  });
  return first ? "0" : out;
}

/** inputs: n rows of n+1 strings (coefficients then constant). */
export function solveSystem(size: 2 | 3, inputs: string[][]): SystemResult {
  const names = NAMES.slice(0, size);
  const rows: Frac[][] = [];
  for (let i = 0; i < size; i++) {
    const row: Frac[] = [];
    for (let j = 0; j <= size; j++) {
      const v = parseFrac(inputs[i]?.[j]);
      if (!v) {
        return {
          valid: false,
          error: `Enter a number in equation ${i + 1} for ${j < size ? names[j] : "the constant"}. Integers, decimals, and fractions like 1/3 are fine.`,
        };
      }
      row.push(v);
    }
    rows.push(row);
  }
  const coefs = rows.map((r) => r.slice(0, size));
  const d = det(coefs);
  const elim = eliminate(rows, names);
  const subSteps = substitute(rows, names);
  const equations = rows.map((r) => formatEquation(r, names));
  let summary: string;
  if (elim.status === "unique") summary = elim.solution.map((v, i) => `${names[i]} = ${f(v)}`).join(", ");
  else if (elim.status === "none") summary = "No solution (inconsistent system)";
  else summary = "Infinitely many solutions (dependent system)";
  return {
    valid: true,
    size,
    names,
    status: elim.status,
    solution: elim.solution,
    determinant: d,
    equations,
    eliminationSteps: elim.steps,
    substitutionSteps: subSteps,
    summary,
  };
}
