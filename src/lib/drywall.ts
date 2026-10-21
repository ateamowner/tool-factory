/** Parse a user-entered number, allowing commas and spaces. Blank returns 0; invalid returns null. */
export function parseNumberInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export type SheetSize = "4x8" | "4x10" | "4x12";

export const SHEET_SIZES: { id: SheetSize; label: string; sqFt: number }[] = [
  { id: "4x8", label: "4 × 8 ft (32 sq ft)", sqFt: 32 },
  { id: "4x10", label: "4 × 10 ft (40 sq ft)", sqFt: 40 },
  { id: "4x12", label: "4 × 12 ft (48 sq ft)", sqFt: 48 },
];

/** Typical openings subtracted from wall area. */
export const DOOR_SQ_FT = 21; // about 3 × 7 ft
export const WINDOW_SQ_FT = 15; // about 3 × 5 ft

/** Rules of thumb for a standard three-coat finish (planning estimates). */
export const MUD_LB_PER_SQ_FT = 0.138; // ready-mixed all-purpose compound, ~138 lb per 1,000 sq ft
export const MUD_LB_PER_PAIL = 61.7; // 4.5-gallon pail
export const MUD_GAL_PER_PAIL = 4.5;
export const TAPE_FT_PER_SQ_FT = 0.37; // ~370 ft of paper tape per 1,000 sq ft
export const TAPE_FT_PER_ROLL = 500;
export const SCREWS_PER_SQ_FT = 1; // ~1 screw per sq ft of board

export type DrywallInput = {
  length: string;
  width: string;
  height: string;
  includeCeiling: boolean;
  doors: string;
  windows: string;
  extraSqFt?: string;
  sheet: SheetSize;
  wastePercent: string;
};

export type DrywallResult =
  | {
      valid: true;
      wallSqFt: number;
      ceilingSqFt: number;
      openingsSqFt: number;
      netSqFt: number;
      sqFtWithWaste: number;
      sheetSqFt: number;
      sheets: number;
      mudLb: number;
      mudGallons: number;
      mudPails: number;
      tapeFt: number;
      tapeRolls: number;
      screws: number;
    }
  | { valid: false; error: string };

export function wallArea(length: number, width: number, height: number): number {
  return 2 * (length + width) * height;
}

export function sheetsNeeded(areaSqFt: number, sheetSqFt: number): number {
  if (areaSqFt <= 0 || sheetSqFt <= 0) return 0;
  return Math.ceil(areaSqFt / sheetSqFt - 1e-9);
}

export function computeDrywall(input: DrywallInput): DrywallResult {
  const length = parseNumberInput(input.length);
  const width = parseNumberInput(input.width);
  const height = parseNumberInput(input.height);
  const doors = parseNumberInput(input.doors);
  const windows = parseNumberInput(input.windows);
  const extra = parseNumberInput(input.extraSqFt);
  const waste = parseNumberInput(input.wastePercent);
  if (length === null || width === null || height === null) return { valid: false, error: "Room size must be numbers." };
  if (length < 0 || width < 0 || height < 0) return { valid: false, error: "Room size cannot be negative." };
  if (doors === null || windows === null || doors < 0 || windows < 0)
    return { valid: false, error: "Doors and windows must be 0 or more." };
  if (extra === null || extra < 0) return { valid: false, error: "Extra area must be 0 or more." };
  if (waste === null || waste < 0) return { valid: false, error: "Waste must be 0% or more." };
  const sheet = SHEET_SIZES.find((s) => s.id === input.sheet);
  if (!sheet) return { valid: false, error: "Pick a sheet size." };

  const wallSqFt = wallArea(length, width, height);
  const ceilingSqFt = input.includeCeiling ? length * width : 0;
  const openingsSqFt = Math.min(wallSqFt, doors * DOOR_SQ_FT + windows * WINDOW_SQ_FT);
  const netSqFt = wallSqFt - openingsSqFt + ceilingSqFt + extra;
  if (netSqFt <= 0) return { valid: false, error: "Enter a room size or an area greater than 0." };

  const sqFtWithWaste = netSqFt * (1 + waste / 100);
  const mudLb = netSqFt * MUD_LB_PER_SQ_FT;
  const tapeFt = netSqFt * TAPE_FT_PER_SQ_FT;
  return {
    valid: true,
    wallSqFt,
    ceilingSqFt,
    openingsSqFt,
    netSqFt,
    sqFtWithWaste,
    sheetSqFt: sheet.sqFt,
    sheets: sheetsNeeded(sqFtWithWaste, sheet.sqFt),
    mudLb,
    mudGallons: (mudLb / MUD_LB_PER_PAIL) * MUD_GAL_PER_PAIL,
    mudPails: Math.max(1, Math.ceil(mudLb / MUD_LB_PER_PAIL - 1e-9)),
    tapeFt,
    tapeRolls: Math.max(1, Math.ceil(tapeFt / TAPE_FT_PER_ROLL - 1e-9)),
    screws: Math.ceil(netSqFt * SCREWS_PER_SQ_FT),
  };
}
