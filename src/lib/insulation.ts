export function parseNumberInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export type Zone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Space = "attic" | "cathedral" | "wall" | "floor";
export type Product = "batt" | "roll" | "cellulose" | "fiberglass";

export const SPACES: { id: Space; label: string }[] = [
  { id: "attic", label: "Attic floor" },
  { id: "cathedral", label: "Cathedral ceiling" },
  { id: "wall", label: "Walls" },
  { id: "floor", label: "Floor / crawl space" },
];

export const PRODUCTS: { id: Product; label: string }[] = [
  { id: "batt", label: "Batts" },
  { id: "roll", label: "Rolls" },
  { id: "cellulose", label: "Blown-in cellulose" },
  { id: "fiberglass", label: "Blown-in fiberglass" },
];

/** Typical recommended total R-values by climate zone (planning targets; local code and the IECC govern). */
export const TARGET_R: Record<Space, Record<Zone, number>> = {
  attic: { 1: 30, 2: 38, 3: 38, 4: 49, 5: 49, 6: 49, 7: 60, 8: 60 },
  cathedral: { 1: 30, 2: 30, 3: 30, 4: 38, 5: 38, 6: 38, 7: 49, 8: 49 },
  wall: { 1: 13, 2: 13, 3: 20, 4: 20, 5: 20, 6: 21, 7: 21, 8: 21 },
  floor: { 1: 13, 2: 13, 3: 19, 4: 25, 5: 30, 6: 30, 7: 38, 8: 38 },
};

/** Standard fiberglass batt and roll R-values sold in stores. */
export const BATT_R_VALUES = [11, 13, 15, 19, 21, 25, 30, 38];
export const BATT_R_PER_INCH = 3.2;

/** Blown-in loose fill: R per inch, installed density (lb per cu ft), and typical bag weight (lb). */
export const BLOWN: Record<"cellulose" | "fiberglass", { rPerInch: number; density: number; bagLb: number }> = {
  cellulose: { rPerInch: 3.6, density: 1.6, bagLb: 25 },
  fiberglass: { rPerInch: 2.5, density: 0.8, bagLb: 30 },
};

export function targetR(space: Space, zone: Zone): number {
  return TARGET_R[space][zone];
}

export function pickBattR(neededR: number): { r: number; layers: number } {
  if (neededR <= 0) return { r: 0, layers: 0 };
  const max = BATT_R_VALUES[BATT_R_VALUES.length - 1];
  if (neededR > max) return { r: max, layers: Math.ceil(neededR / max) };
  const r = BATT_R_VALUES.find((v) => v >= neededR) ?? max;
  return { r, layers: 1 };
}

export type InsulationInput = {
  area: string;
  zone: Zone;
  space: Space;
  product: Product;
  existingR: string;
  targetOverride?: string;
  wastePercent: string;
  pieceWidthIn: string;
  pieceLengthFt: string;
};

export type InsulationResult =
  | {
      valid: true;
      targetR: number;
      existingR: number;
      neededR: number;
      areaWithWaste: number;
      thicknessIn: number;
      kind: "piece";
      battR: number;
      layers: number;
      pieceSqFt: number;
      pieces: number;
      coveredSqFt: number;
    }
  | {
      valid: true;
      targetR: number;
      existingR: number;
      neededR: number;
      areaWithWaste: number;
      thicknessIn: number;
      kind: "blown";
      cubicFeet: number;
      pounds: number;
      bags: number;
      bagLb: number;
      sqFtPerBag: number;
    }
  | { valid: true; targetR: number; existingR: number; neededR: number; kind: "none" }
  | { valid: false; error: string };

export function computeInsulation(input: InsulationInput): InsulationResult {
  const area = parseNumberInput(input.area);
  const existing = parseNumberInput(input.existingR);
  const waste = parseNumberInput(input.wastePercent);
  const override = input.targetOverride && input.targetOverride.trim() !== "" ? parseNumberInput(input.targetOverride) : null;
  if (area === null || area <= 0) return { valid: false, error: "Enter the area to insulate in square feet." };
  if (existing === null || existing < 0) return { valid: false, error: "Existing R-value must be 0 or more." };
  if (waste === null || waste < 0 || waste > 50) return { valid: false, error: "Waste should be between 0% and 50%." };
  if (override !== null && override <= 0) return { valid: false, error: "Target R-value must be above 0." };
  const target = override ?? targetR(input.space, input.zone);
  const needed = Math.max(0, target - existing);
  if (needed === 0) return { valid: true, kind: "none", targetR: target, existingR: existing, neededR: 0 };
  const areaWithWaste = area * (1 + waste / 100);

  if (input.product === "batt" || input.product === "roll") {
    const widthIn = parseNumberInput(input.pieceWidthIn);
    const lengthFt = parseNumberInput(input.pieceLengthFt);
    if (widthIn === null || widthIn <= 0) return { valid: false, error: "Enter the batt or roll width in inches." };
    if (lengthFt === null || lengthFt <= 0) return { valid: false, error: "Enter the batt or roll length in feet." };
    const { r, layers } = pickBattR(needed);
    const pieceSqFt = (widthIn * lengthFt) / 12;
    const perLayer = Math.ceil(areaWithWaste / pieceSqFt - 1e-9);
    return {
      valid: true,
      kind: "piece",
      targetR: target,
      existingR: existing,
      neededR: needed,
      areaWithWaste,
      thicknessIn: (r * layers) / BATT_R_PER_INCH,
      battR: r,
      layers,
      pieceSqFt,
      pieces: perLayer * layers,
      coveredSqFt: pieceSqFt * perLayer,
    };
  }

  const b = BLOWN[input.product];
  const thicknessIn = needed / b.rPerInch;
  const cubicFeet = (areaWithWaste * thicknessIn) / 12;
  const pounds = cubicFeet * b.density;
  const bags = Math.ceil(pounds / b.bagLb - 1e-9);
  return {
    valid: true,
    kind: "blown",
    targetR: target,
    existingR: existing,
    neededR: needed,
    areaWithWaste,
    thicknessIn,
    cubicFeet,
    pounds,
    bags,
    bagLb: b.bagLb,
    sqFtPerBag: (b.bagLb / b.density / (thicknessIn / 12)),
  };
}
