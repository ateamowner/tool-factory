export type QuadraticRoot = { re: number; im: number };

export type QuadraticResult =
  | {
      valid: true;
      a: number;
      b: number;
      c: number;
      discriminant: number;
      rootKind: "two-real" | "one-real" | "complex";
      roots: QuadraticRoot[];
      rootsText: string[];
      vertex: { x: number; y: number };
      axisOfSymmetry: number;
      opens: "up" | "down";
      steps: string[];
    }
  | { valid: false; error: string };

function clean(n: number): number {
  const r = Math.round(n * 1e10) / 1e10;
  return Object.is(r, -0) ? 0 : r;
}

export function formatNumber(n: number): string {
  const v = clean(n);
  if (Number.isInteger(v)) return v.toString();
  return Number(v.toPrecision(10)).toString();
}

export function formatRoot(root: QuadraticRoot): string {
  const re = clean(root.re);
  const im = clean(root.im);
  if (im === 0) return formatNumber(re);
  const sign = im < 0 ? "−" : "+";
  const imAbs = formatNumber(Math.abs(im));
  const imPart = imAbs === "1" ? "i" : `${imAbs}i`;
  if (re === 0) return im < 0 ? `−${imPart}` : imPart;
  return `${formatNumber(re)} ${sign} ${imPart}`;
}

function parse(raw: string): number | null {
  const t = raw.trim().replace(/−/g, "-");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function solveQuadratic(aRaw: string, bRaw: string, cRaw: string): QuadraticResult {
  const a = parse(aRaw);
  const b = parse(bRaw);
  const c = parse(cRaw);
  if (a === null || b === null || c === null) {
    return { valid: false, error: "Enter a number for each of a, b, and c." };
  }
  if (a === 0) {
    return {
      valid: false,
      error: "a cannot be 0. With a = 0 the equation is linear (bx + c = 0), not quadratic.",
    };
  }

  const d = b * b - 4 * a * c;
  const dClean = clean(d);
  const twoA = 2 * a;
  let roots: QuadraticRoot[];
  let rootKind: "two-real" | "one-real" | "complex";

  if (dClean > 0) {
    const s = Math.sqrt(d);
    // Numerically stable form avoids cancellation when b is large.
    const q = -0.5 * (b + Math.sign(b || 1) * s);
    const r1 = q / a;
    const r2 = q !== 0 ? c / q : -r1;
    roots = [r1, r2].sort((x, y) => x - y).map((re) => ({ re, im: 0 }));
    rootKind = "two-real";
  } else if (dClean === 0) {
    roots = [{ re: -b / twoA, im: 0 }];
    rootKind = "one-real";
  } else {
    const re = -b / twoA;
    const im = Math.sqrt(-d) / Math.abs(twoA);
    roots = [
      { re, im },
      { re, im: -im },
    ];
    rootKind = "complex";
  }

  const vx = -b / twoA;
  const vy = c - (b * b) / (4 * a);
  const f = formatNumber;
  const steps = [
    `Start with ax² + bx + c = 0, where a = ${f(a)}, b = ${f(b)}, c = ${f(c)}.`,
    `Discriminant: D = b² − 4ac = (${f(b)})² − 4 × ${f(a)} × ${f(c)} = ${f(b * b)} − ${f(4 * a * c)} = ${f(d)}.`,
    rootKind === "two-real"
      ? `D > 0, so there are two distinct real roots.`
      : rootKind === "one-real"
        ? `D = 0, so there is one repeated real root.`
        : `D < 0, so there are two complex conjugate roots.`,
    rootKind === "complex"
      ? `x = (−b ± i√|D|) / 2a = (${f(-b)} ± i√${f(-d)}) / ${f(twoA)}.`
      : `x = (−b ± √D) / 2a = (${f(-b)} ± √${f(Math.max(d, 0))}) / ${f(twoA)}.`,
    `Roots: ${roots.map(formatRoot).join(rootKind === "one-real" ? "" : " and ")}.`,
    `Vertex: x = −b / 2a = ${f(vx)}, y = c − b² / 4a = ${f(vy)}, so the vertex is (${f(vx)}, ${f(vy)}).`,
  ];

  return {
    valid: true,
    a,
    b,
    c,
    discriminant: clean(d),
    rootKind,
    roots,
    rootsText: roots.map(formatRoot),
    vertex: { x: clean(vx), y: clean(vy) },
    axisOfSymmetry: clean(vx),
    opens: a > 0 ? "up" : "down",
    steps,
  };
}
