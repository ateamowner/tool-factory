export const WALL_HEIGHT_FT_PER_STORY = 9;
export const ROOF_PITCH_BUMP_FACTOR = 1.118;

export const HOUSE_AREA_MODES = ["dimensions", "footprint"] as const;
export type HouseAreaMode = (typeof HOUSE_AREA_MODES)[number];

export const HOUSE_TARGETS = ["walls", "roof"] as const;
export type HouseTarget = (typeof HOUSE_TARGETS)[number];

export const HOUSE_STORIES = [1, 2] as const;
export type HouseStories = (typeof HOUSE_STORIES)[number];

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function roundSqFt(value: number): number {
  return Math.round(value * 10) / 10;
}

export function isHouseAreaMode(value: string): value is HouseAreaMode {
  return (HOUSE_AREA_MODES as readonly string[]).includes(value);
}

export function isHouseTarget(value: string): value is HouseTarget {
  return (HOUSE_TARGETS as readonly string[]).includes(value);
}

export function resolveFootprint(input: {
  mode: HouseAreaMode;
  lengthFt: number;
  widthFt: number;
  footprintSqFt: number;
}): number | null {
  if (input.mode === "footprint") {
    if (!isFiniteNumber(input.footprintSqFt) || input.footprintSqFt <= 0) return null;
    return input.footprintSqFt;
  }
  if (!isFiniteNumber(input.lengthFt) || input.lengthFt <= 0) return null;
  if (!isFiniteNumber(input.widthFt) || input.widthFt <= 0) return null;
  return input.lengthFt * input.widthFt;
}

export function resolveRectangleSides(input: {
  mode: HouseAreaMode;
  lengthFt: number;
  widthFt: number;
  footprintSqFt: number;
}): { lengthFt: number; widthFt: number } | null {
  if (input.mode === "dimensions") {
    if (!isFiniteNumber(input.lengthFt) || input.lengthFt <= 0) return null;
    if (!isFiniteNumber(input.widthFt) || input.widthFt <= 0) return null;
    return { lengthFt: input.lengthFt, widthFt: input.widthFt };
  }
  if (!isFiniteNumber(input.footprintSqFt) || input.footprintSqFt <= 0) return null;
  const side = Math.sqrt(input.footprintSqFt);
  return { lengthFt: side, widthFt: side };
}

export type HouseSqFtResult = {
  valid: boolean;
  error: string | null;
  target: HouseTarget | null;
  stories: HouseStories | null;
  footprintSqFt: number | null;
  wallSqFt: number | null;
  roofSqFt: number | null;
  estimateSqFt: number | null;
  quoteSurface: "siding" | "roof" | null;
  methodLabel: string | null;
};

const emptyResult: HouseSqFtResult = {
  valid: false,
  error: null,
  target: null,
  stories: null,
  footprintSqFt: null,
  wallSqFt: null,
  roofSqFt: null,
  estimateSqFt: null,
  quoteSurface: null,
  methodLabel: null,
};

export function estimateHouseSqFt(input: {
  mode: HouseAreaMode;
  lengthFt: number;
  widthFt: number;
  footprintSqFt: number;
  stories: HouseStories;
  target: HouseTarget;
  pitchBump: boolean;
}): HouseSqFtResult {
  if (!isHouseAreaMode(input.mode) || !isHouseTarget(input.target)) {
    return { ...emptyResult, error: "Choose walls or roof and enter the house size." };
  }
  if (input.stories !== 1 && input.stories !== 2) {
    return { ...emptyResult, error: "Choose 1 or 2 stories." };
  }

  const sides = resolveRectangleSides(input);
  const footprint = resolveFootprint(input);
  if (sides === null || footprint === null) {
    return {
      ...emptyResult,
      target: input.target,
      stories: input.stories,
      error:
        input.mode === "footprint"
          ? "Enter a footprint greater than zero."
          : "Enter length and width greater than zero.",
    };
  }

  const wallSqFt = roundSqFt(
    2 * (sides.lengthFt + sides.widthFt) * WALL_HEIGHT_FT_PER_STORY * input.stories,
  );
  const roofFactor = input.pitchBump ? ROOF_PITCH_BUMP_FACTOR : 1;
  const roofSqFt = roundSqFt(footprint * roofFactor);

  const estimateSqFt = input.target === "walls" ? wallSqFt : roofSqFt;
  const methodLabel =
    input.target === "walls"
      ? input.mode === "footprint"
        ? `Walls: 2 × (side + side) × ${WALL_HEIGHT_FT_PER_STORY} ft × ${input.stories} stor${input.stories === 1 ? "y" : "ies"}, treating the footprint as a square.`
        : `Walls: 2 × (L + W) × ${WALL_HEIGHT_FT_PER_STORY} ft × ${input.stories} stor${input.stories === 1 ? "y" : "ies"}. Openings are not deducted.`
      : input.pitchBump
        ? `Roof: footprint × ${ROOF_PITCH_BUMP_FACTOR} (educational 6/12 pitch bump).`
        : "Roof: plan footprint with no pitch bump.";

  return {
    valid: true,
    error: null,
    target: input.target,
    stories: input.stories,
    footprintSqFt: roundSqFt(footprint),
    wallSqFt,
    roofSqFt,
    estimateSqFt,
    quoteSurface: input.target === "walls" ? "siding" : "roof",
    methodLabel,
  };
}
