export const CUBIC_FEET_PER_CUBIC_YARD = 27;
export const DEFAULT_CONCRETE_WASTE_PERCENT = 10;
/** Approximate yield in cubic feet per premix bag. */
export const BAG_YIELDS = [
  { id: "40", label: "40 lb bag", cubicFeet: 0.3 },
  { id: "60", label: "60 lb bag", cubicFeet: 0.45 },
  { id: "80", label: "80 lb bag", cubicFeet: 0.6 },
] as const;

export const CONCRETE_SHAPES = ["slab", "column"] as const;
export type ConcreteShape = (typeof CONCRETE_SHAPES)[number];

export type ConcreteInput = {
  shape: ConcreteShape;
  lengthFt: number;
  widthFt: number;
  thicknessIn: number;
  diameterIn: number;
  heightFt: number;
  quantity: number;
  wastePercent: number;
};

export type ConcreteResult = {
  valid: boolean;
  error: string | null;
  cubicFeet: number | null;
  cubicYards: number | null;
  adjustedCubicFeet: number | null;
  adjustedCubicYards: number | null;
  bags: { id: string; label: string; count: number }[];
};

const fail = (error: string): ConcreteResult => ({
  valid: false,
  error,
  cubicFeet: null,
  cubicYards: null,
  adjustedCubicFeet: null,
  adjustedCubicYards: null,
  bags: [],
});

const positive = (n: number) => Number.isFinite(n) && n > 0;

export function calculateConcrete(input: ConcreteInput): ConcreteResult {
  const qty = Number.isFinite(input.quantity) && input.quantity > 0 ? Math.floor(input.quantity) : NaN;
  if (!positive(qty)) return fail("Enter a quantity of 1 or more.");
  const waste = input.wastePercent;
  if (!Number.isFinite(waste) || waste < 0 || waste > 100) return fail("Waste must be 0 to 100%.");
  let each: number;
  if (input.shape === "slab") {
    if (!positive(input.lengthFt) || !positive(input.widthFt) || !positive(input.thicknessIn)) {
      return fail("Enter length, width, and thickness greater than zero.");
    }
    each = input.lengthFt * input.widthFt * (input.thicknessIn / 12);
  } else {
    if (!positive(input.diameterIn) || !positive(input.heightFt)) {
      return fail("Enter diameter and height greater than zero.");
    }
    const r = input.diameterIn / 12 / 2;
    each = Math.PI * r * r * input.heightFt;
  }
  const cubicFeet = each * qty;
  const adjustedCubicFeet = cubicFeet * (1 + waste / 100);
  return {
    valid: true,
    error: null,
    cubicFeet,
    cubicYards: cubicFeet / CUBIC_FEET_PER_CUBIC_YARD,
    adjustedCubicFeet,
    adjustedCubicYards: adjustedCubicFeet / CUBIC_FEET_PER_CUBIC_YARD,
    bags: BAG_YIELDS.map((b) => ({
      id: b.id,
      label: b.label,
      count: Math.ceil(adjustedCubicFeet / b.cubicFeet - 1e-9),
    })),
  };
}

export function parseAmount(text: string): number {
  const t = text.replace(/,/g, "").trim();
  if (t === "") return NaN;
  return Number(t);
}

export const formatNumber = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
