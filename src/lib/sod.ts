import { parseNumberInput } from "./drywall.ts";

/** Common sod sizes (planning defaults; suppliers vary). */
export const DEFAULT_ROLL_SQ_FT = 10; // 2 × 5 ft slab or roll
export const DEFAULT_PALLET_SQ_FT = 450; // typical pallet covers 400–500 sq ft

export type SodInput = {
  mode: "area" | "dimensions";
  areaSqFt: string;
  length: string;
  width: string;
  wastePercent: string;
  rollSqFt: string;
  palletSqFt: string;
};

export type SodResult =
  | {
      valid: true;
      baseSqFt: number;
      sqFtWithWaste: number;
      sqYards: number;
      rolls: number;
      pallets: number;
      palletsExact: number;
    }
  | { valid: false; error: string };

export function sodArea(length: number, width: number): number {
  return length * width;
}

export function unitsNeeded(sqFt: number, perUnit: number): number {
  if (sqFt <= 0 || perUnit <= 0) return 0;
  return Math.ceil(sqFt / perUnit - 1e-9);
}

export function computeSod(input: SodInput): SodResult {
  const area = parseNumberInput(input.areaSqFt);
  const length = parseNumberInput(input.length);
  const width = parseNumberInput(input.width);
  const waste = parseNumberInput(input.wastePercent);
  const roll = parseNumberInput(input.rollSqFt);
  const pallet = parseNumberInput(input.palletSqFt);
  if ([area, length, width, waste, roll, pallet].some((n) => n === null)) {
    return { valid: false, error: "Enter numbers only." };
  }
  if ((area as number) < 0 || (length as number) < 0 || (width as number) < 0) {
    return { valid: false, error: "Sizes can't be negative." };
  }
  if ((waste as number) < 0 || (waste as number) > 100) {
    return { valid: false, error: "Waste must be between 0 and 100%." };
  }
  if ((roll as number) <= 0 || (pallet as number) <= 0) {
    return { valid: false, error: "Roll and pallet coverage must be more than 0 sq ft." };
  }
  const baseSqFt = input.mode === "area" ? (area as number) : sodArea(length as number, width as number);
  if (baseSqFt <= 0) {
    return { valid: false, error: "Enter the lawn area or its length and width." };
  }
  const sqFtWithWaste = baseSqFt * (1 + (waste as number) / 100);
  const palletsExact = sqFtWithWaste / (pallet as number);
  return {
    valid: true,
    baseSqFt,
    sqFtWithWaste,
    sqYards: sqFtWithWaste / 9,
    rolls: unitsNeeded(sqFtWithWaste, roll as number),
    pallets: unitsNeeded(sqFtWithWaste, pallet as number),
    palletsExact,
  };
}
