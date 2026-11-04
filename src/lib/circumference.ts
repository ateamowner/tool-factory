export type CircleKnown = "radius" | "diameter" | "circumference" | "area";

export type CircleResult =
  | {
      valid: true;
      radius: number;
      diameter: number;
      circumference: number;
      area: number;
      /** Coefficient of π for circumference (C = k·π) */
      circumferencePiCoef: number;
      /** Coefficient of π for area (A = k·π) */
      areaPiCoef: number;
      radiusExpr: string;
      diameterExpr: string;
      circumferenceExpr: string;
      areaExpr: string;
    }
  | { valid: false; error: string };

export const CIRCLE_LABELS: Record<CircleKnown, string> = {
  radius: "Radius (r)",
  diameter: "Diameter (d)",
  circumference: "Circumference (C)",
  area: "Area (A)",
};

export function parsePositive(raw: string): number | null {
  const s = raw.trim().replace(/,/g, "");
  if (s === "") return null;
  if (!/^[+]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Format a number with up to `digits` decimals, trimming trailing zeros. */
export function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "";
  if (n !== 0 && (Math.abs(n) >= 1e12 || Math.abs(n) < 1e-6)) return n.toExponential(digits);
  const fixed = n.toFixed(digits);
  const trimmed = fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
  const [intPart, dec] = trimmed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withCommas}.${dec}` : withCommas;
}

/** k·π written as text, e.g. "10π", "π", "2.5π". */
export function piText(k: number, digits = 4): string {
  const s = fmt(k, digits);
  return s === "1" ? "π" : `${s}π`;
}

export function radiusFrom(known: CircleKnown, value: number): number {
  switch (known) {
    case "radius":
      return value;
    case "diameter":
      return value / 2;
    case "circumference":
      return value / (2 * Math.PI);
    case "area":
      return Math.sqrt(value / Math.PI);
  }
}

export function solveCircle(known: CircleKnown, raw: string, unit = ""): CircleResult {
  const value = parsePositive(raw);
  if (value === null) return { valid: false, error: "Enter a positive number." };
  const u = unit ? ` ${unit}` : "";
  const u2 = unit ? ` ${unit}²` : "";
  const r = radiusFrom(known, value);
  const d = 2 * r;
  const C = 2 * Math.PI * r;
  const A = Math.PI * r * r;
  const cCoef = d;
  const aCoef = r * r;

  let radiusExpr = `${fmt(r)}${u}`;
  let diameterExpr = `${fmt(d)}${u}`;
  if (known === "circumference") {
    radiusExpr = `${fmt(value)}/(2π) = ${fmt(r)}${u}`;
    diameterExpr = `${fmt(value)}/π = ${fmt(d)}${u}`;
  } else if (known === "area") {
    radiusExpr = `√(${fmt(value)}/π) = ${fmt(r)}${u}`;
    diameterExpr = `2√(${fmt(value)}/π) = ${fmt(d)}${u}`;
  }
  const circumferenceExpr =
    known === "circumference" ? `${fmt(C)}${u}` : `${piText(cCoef)}${u} ≈ ${fmt(C)}${u}`;
  const areaExpr = known === "area" ? `${fmt(A)}${u2}` : `${piText(aCoef)}${u2} ≈ ${fmt(A)}${u2}`;

  return {
    valid: true,
    radius: r,
    diameter: d,
    circumference: C,
    area: A,
    circumferencePiCoef: cCoef,
    areaPiCoef: aCoef,
    radiusExpr,
    diameterExpr,
    circumferenceExpr,
    areaExpr,
  };
}
