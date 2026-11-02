/** Parse a user-entered number, allowing commas and spaces. Blank returns 0; invalid returns null. */
function parseNumberInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export type SunExposure = "shaded" | "normal" | "sunny";
export type Climate = "warm" | "moderate" | "cool" | "cold";

export type BtuInput = {
  mode: "dimensions" | "area";
  length: string;
  width: string;
  areaSqFt: string;
  ceilingFt: string;
  sun: SunExposure;
  people: string;
  kitchen: boolean;
  climate: Climate;
};

export type BtuResult =
  | {
      valid: true;
      areaSqFt: number;
      baseCooling: number;
      ceilingFactor: number;
      coolingBtu: number;
      heatingBtu: number;
      tons: number;
      suggestedUnitBtu: number | null;
      overMaxUnit: boolean;
    }
  | { valid: false; error: string };

/** ENERGY STAR room air conditioner sizing chart: [max sq ft, BTU/hr]. */
export const ENERGY_STAR_CHART: readonly (readonly [number, number])[] = [
  [150, 5000],
  [250, 6000],
  [300, 7000],
  [350, 8000],
  [400, 9000],
  [450, 10000],
  [550, 12000],
  [700, 14000],
  [1000, 18000],
  [1200, 21000],
  [1400, 23000],
  [1500, 24000],
  [2000, 30000],
  [2500, 34000],
];

/** Common AC unit sizes sold (window, mini-split and central), BTU/hr. */
export const STANDARD_AC_SIZES = [
  5000, 6000, 8000, 10000, 12000, 14000, 18000, 24000, 30000, 36000, 42000, 48000, 60000,
] as const;

/** Rough heating load per square foot by climate (8 ft ceilings, average insulation). */
export const HEATING_BTU_PER_SQ_FT: Record<Climate, number> = {
  warm: 30,
  moderate: 40,
  cool: 50,
  cold: 60,
};

export const KITCHEN_BTU = 4000;
export const EXTRA_PERSON_BTU = 600;

/** Base cooling BTU for a floor area. Uses the ENERGY STAR chart, then 20 BTU per sq ft above 2,500 sq ft. */
export function baseCoolingBtu(areaSqFt: number): number {
  if (!(areaSqFt > 0)) return 0;
  for (const [maxSqFt, btu] of ENERGY_STAR_CHART) {
    if (areaSqFt <= maxSqFt) return btu;
  }
  return Math.round(areaSqFt * 20);
}

/** Ceiling factor: 1 at 8 ft or lower, scaled by height / 8 above that. */
export function ceilingFactor(ceilingFt: number): number {
  if (!(ceilingFt > 8)) return 1;
  return ceilingFt / 8;
}

export function suggestUnit(btu: number): number | null {
  for (const size of STANDARD_AC_SIZES) {
    if (size >= btu) return size;
  }
  return null;
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export function computeBtu(input: BtuInput): BtuResult {
  let area: number | null;
  if (input.mode === "area") {
    area = parseNumberInput(input.areaSqFt);
  } else {
    const l = parseNumberInput(input.length);
    const w = parseNumberInput(input.width);
    area = l === null || w === null ? null : l * w;
  }
  if (area === null || !(area > 0)) return { valid: false, error: "Enter the room size to see BTUs." };
  if (area > 100000) return { valid: false, error: "That area is too large for a room estimate." };

  const ceilingRaw = input.ceilingFt.trim() === "" ? 8 : parseNumberInput(input.ceilingFt);
  if (ceilingRaw === null || !(ceilingRaw > 0) || ceilingRaw > 40) {
    return { valid: false, error: "Enter a ceiling height between 1 and 40 ft." };
  }
  const peopleRaw = input.people.trim() === "" ? 2 : parseNumberInput(input.people);
  if (peopleRaw === null || peopleRaw < 0 || peopleRaw > 100 || !Number.isInteger(peopleRaw)) {
    return { valid: false, error: "Enter a whole number of people." };
  }

  const base = baseCoolingBtu(area);
  const cf = ceilingFactor(ceilingRaw);
  let cooling = base * cf;
  if (input.sun === "shaded") cooling *= 0.9;
  if (input.sun === "sunny") cooling *= 1.1;
  if (peopleRaw > 2) cooling += (peopleRaw - 2) * EXTRA_PERSON_BTU;
  if (input.kitchen) cooling += KITCHEN_BTU;
  const coolingBtu = roundTo(cooling, 100);

  const heatingBtu = roundTo(area * HEATING_BTU_PER_SQ_FT[input.climate] * cf, 100);
  const suggested = suggestUnit(coolingBtu);

  return {
    valid: true,
    areaSqFt: area,
    baseCooling: base,
    ceilingFactor: cf,
    coolingBtu,
    heatingBtu,
    tons: coolingBtu / 12000,
    suggestedUnitBtu: suggested,
    overMaxUnit: suggested === null,
  };
}
