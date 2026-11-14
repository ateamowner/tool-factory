/** Parse a user-entered number, allowing commas and spaces. Blank returns 0; invalid returns null. */
export function parseNumberInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export type WallUnit = "ft" | "m";

export const FT_PER_M = 3.28084;
export const IN_PER_FT = 12;

/** Typical openings subtracted from wall area, in square feet. */
export const DOOR_SQ_FT = 21; // about 3 × 7 ft
export const WINDOW_SQ_FT = 15; // about 3 × 5 ft

export type RollPreset = { id: string; label: string; widthIn: number; lengthFt: number };

export const ROLL_PRESETS: RollPreset[] = [
  { id: "us-single", label: "US single roll, 20.5 in × 33 ft", widthIn: 20.5, lengthFt: 33 },
  { id: "euro", label: "European roll, 21 in (53 cm) × 33 ft (10.05 m)", widthIn: 20.87, lengthFt: 32.97 },
  { id: "us-double", label: "US double roll, 20.5 in × 66 ft", widthIn: 20.5, lengthFt: 66 },
  { id: "custom", label: "Custom roll size", widthIn: 0, lengthFt: 0 },
];

export type WallpaperInput = {
  unit: WallUnit;
  length: string;
  width: string;
  height: string;
  doors: string;
  windows: string;
  roll: string;
  customWidth?: string; // inches
  customLength?: string; // feet
  repeat: string; // inches, 0 for none
  wastePercent: string;
};

export type WallpaperResult =
  | {
      valid: true;
      wallSqFt: number;
      openingsSqFt: number;
      netSqFt: number;
      dropFt: number;
      stripsNeeded: number;
      stripsWithWaste: number;
      stripsPerRoll: number;
      rolls: number;
      rollSqFt: number;
    }
  | { valid: false; error: string };

/** Length of one strip: wall height rounded up to a whole pattern repeat (or plain height with no repeat). */
export function dropLength(heightFt: number, repeatIn: number): number {
  if (heightFt <= 0) return 0;
  if (repeatIn <= 0) return heightFt;
  const repeatFt = repeatIn / IN_PER_FT;
  return Math.ceil(heightFt / repeatFt - 1e-9) * repeatFt;
}

export function computeWallpaper(input: WallpaperInput): WallpaperResult {
  const length = parseNumberInput(input.length);
  const width = parseNumberInput(input.width);
  const height = parseNumberInput(input.height);
  const doors = parseNumberInput(input.doors);
  const windows = parseNumberInput(input.windows);
  const repeat = parseNumberInput(input.repeat);
  const waste = parseNumberInput(input.wastePercent);
  if (length === null || width === null || height === null) return { valid: false, error: "Room size must be numbers." };
  if (length < 0 || width < 0 || height < 0) return { valid: false, error: "Room size cannot be negative." };
  if (doors === null || windows === null || doors < 0 || windows < 0)
    return { valid: false, error: "Doors and windows must be 0 or more." };
  if (repeat === null || repeat < 0) return { valid: false, error: "Pattern repeat must be 0 or more." };
  if (waste === null || waste < 0) return { valid: false, error: "Waste must be 0% or more." };

  const preset = ROLL_PRESETS.find((p) => p.id === input.roll);
  if (!preset) return { valid: false, error: "Pick a roll size." };
  let rollWidthIn = preset.widthIn;
  let rollLengthFt = preset.lengthFt;
  if (preset.id === "custom") {
    const cw = parseNumberInput(input.customWidth);
    const cl = parseNumberInput(input.customLength);
    if (cw === null || cl === null || cw <= 0 || cl <= 0)
      return { valid: false, error: "Enter the roll width (in) and roll length (ft)." };
    rollWidthIn = cw;
    rollLengthFt = cl;
  }

  const toFt = input.unit === "m" ? FT_PER_M : 1;
  const lengthFt = length * toFt;
  const widthFt = width * toFt;
  const heightFt = height * toFt;
  const wallSqFt = 2 * (lengthFt + widthFt) * heightFt;
  const openingsSqFt = Math.min(wallSqFt, doors * DOOR_SQ_FT + windows * WINDOW_SQ_FT);
  const netSqFt = wallSqFt - openingsSqFt;
  if (netSqFt <= 0) return { valid: false, error: "Enter a room size greater than 0." };

  const dropFt = dropLength(heightFt, repeat);
  if (dropFt > rollLengthFt) return { valid: false, error: "One strip is longer than the roll. Check wall height and repeat." };
  const stripsPerRoll = Math.floor(rollLengthFt / dropFt + 1e-9);
  const stripAreaSqFt = (rollWidthIn / IN_PER_FT) * dropFt;
  const stripsNeeded = Math.ceil(netSqFt / stripAreaSqFt - 1e-9);
  const stripsWithWaste = Math.ceil(stripsNeeded * (1 + waste / 100) - 1e-9);
  return {
    valid: true,
    wallSqFt,
    openingsSqFt,
    netSqFt,
    dropFt,
    stripsNeeded,
    stripsWithWaste,
    stripsPerRoll,
    rolls: Math.ceil(stripsWithWaste / stripsPerRoll - 1e-9),
    rollSqFt: (rollWidthIn / IN_PER_FT) * rollLengthFt,
  };
}
