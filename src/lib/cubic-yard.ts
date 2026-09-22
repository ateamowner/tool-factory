export const CUBIC_FEET_PER_CUBIC_YARD = 27;
export const INCHES_PER_FOOT = 12;

export type CubicYardMode = "rectangle" | "cylinder";

export type LengthUnit = "ft" | "in";

export type CubicYardStatus = "ok" | "invalid" | "value_required";

export type CubicYardInput = {
  mode: CubicYardMode;
  length: number;
  lengthUnit: LengthUnit;
  width: number;
  widthUnit: LengthUnit;
  diameter: number;
  diameterUnit: LengthUnit;
  depth: number;
  depthUnit: LengthUnit;
  /** Null skips the optional bag helper. */
  bagCubicFeet: number | null;
};

export type CubicYardResult = {
  status: CubicYardStatus;
  valid: boolean;
  error: string | null;
  mode: CubicYardMode;
  cubicFeet: number | null;
  cubicYards: number | null;
  lengthFt: number | null;
  widthFt: number | null;
  diameterFt: number | null;
  depthFt: number | null;
  bags: number | null;
  bagCubicFeet: number | null;
};

const MODES: CubicYardMode[] = ["rectangle", "cylinder"];

const emptyResult = (
  status: CubicYardStatus,
  error: string,
  mode: CubicYardMode,
): CubicYardResult => ({
  status,
  valid: false,
  error,
  mode,
  cubicFeet: null,
  cubicYards: null,
  lengthFt: null,
  widthFt: null,
  diameterFt: null,
  depthFt: null,
  bags: null,
  bagCubicFeet: null,
});

/** Strip thousands separators. Empty input is NaN so callers can reject it. */
export function parseDimension(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

/** Inches become feet (÷ 12) before any volume multiply. */
export function toFeet(value: number, unit: LengthUnit): number {
  return unit === "in" ? value / INCHES_PER_FOOT : value;
}

/** Cubic yards = cubic feet / 27. */
export function cubicFeetToYards(cubicFeet: number): number {
  return cubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
}

export function rectangleCubicFeet(lengthFt: number, widthFt: number, depthFt: number): number {
  return lengthFt * widthFt * depthFt;
}

/** Cylinder volume from diameter, not radius. Radius is half the diameter in feet. */
export function cylinderCubicFeet(diameterFt: number, depthFt: number): number {
  const radiusFt = diameterFt / 2;
  return Math.PI * radiusFt * radiusFt * depthFt;
}

/** Whole bags, rounding up except for values that are already an integer within float error. */
export function bagsForVolume(cubicFeet: number, bagCubicFeet: number): number {
  if (cubicFeet === 0) return 0;
  const raw = cubicFeet / bagCubicFeet;
  const nearest = Math.round(raw);
  if (Math.abs(raw - nearest) < 1e-8) return nearest;
  return Math.ceil(raw);
}

export function formatVolume(value: number, unit: "yd³" | "ft³"): string {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
  return `${formatted} ${unit}`;
}

export function formatFeet(value: number): string {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
  return `${formatted} ft`;
}

type DimensionRead =
  | { ok: true; feet: number }
  | { ok: false; status: CubicYardStatus; error: string };

function readDimension(value: number, unit: LengthUnit, label: string): DimensionRead {
  if (unit !== "ft" && unit !== "in") {
    return {
      ok: false,
      status: "invalid",
      error: `Choose feet or inches for ${label}.`,
    };
  }

  if (!Number.isFinite(value)) {
    return {
      ok: false,
      status: "invalid",
      error: `Enter a finite ${label} of 0 or more. Empty and infinite values are not a volume.`,
    };
  }

  if (value < 0) {
    return {
      ok: false,
      status: "value_required",
      error: `${label[0]?.toUpperCase() ?? ""}${label.slice(1)} must be 0 or more. Inches are converted to feet before dividing by 27.`,
    };
  }

  return { ok: true, feet: toFeet(value, unit) };
}

function readBag(
  bagCubicFeet: number | null,
): { ok: true; bagCubicFeet: number | null } | { ok: false; status: CubicYardStatus; error: string } {
  if (bagCubicFeet === null) {
    return { ok: true, bagCubicFeet: null };
  }

  if (!Number.isFinite(bagCubicFeet)) {
    return {
      ok: false,
      status: "invalid",
      error: "Enter a finite bag size in cubic feet, or leave bags blank.",
    };
  }

  if (bagCubicFeet <= 0) {
    return {
      ok: false,
      status: "value_required",
      error: "Bag size must be greater than 0 cubic feet, or leave bags blank.",
    };
  }

  return { ok: true, bagCubicFeet };
}

export function calculateCubicYards(input: CubicYardInput): CubicYardResult {
  const mode = input.mode;
  if (!MODES.includes(mode)) {
    return emptyResult("invalid", "Choose a rectangle or a cylinder.", "rectangle");
  }

  const depth = readDimension(input.depth, input.depthUnit, "depth");
  if (!depth.ok) {
    return emptyResult(depth.status, depth.error, mode);
  }

  const bag = readBag(input.bagCubicFeet);
  if (!bag.ok) {
    return emptyResult(bag.status, bag.error, mode);
  }

  let lengthFt: number | null = null;
  let widthFt: number | null = null;
  let diameterFt: number | null = null;
  let cubicFeet: number;

  if (mode === "rectangle") {
    const length = readDimension(input.length, input.lengthUnit, "length");
    if (!length.ok) return emptyResult(length.status, length.error, mode);
    const width = readDimension(input.width, input.widthUnit, "width");
    if (!width.ok) return emptyResult(width.status, width.error, mode);
    lengthFt = length.feet;
    widthFt = width.feet;
    cubicFeet = rectangleCubicFeet(lengthFt, widthFt, depth.feet);
  } else {
    const diameter = readDimension(input.diameter, input.diameterUnit, "diameter");
    if (!diameter.ok) return emptyResult(diameter.status, diameter.error, mode);
    diameterFt = diameter.feet;
    cubicFeet = cylinderCubicFeet(diameterFt, depth.feet);
  }

  const cubicYards = cubicFeetToYards(cubicFeet);
  if (!Number.isFinite(cubicFeet) || !Number.isFinite(cubicYards)) {
    return emptyResult(
      "invalid",
      "That volume is too large to calculate. Enter smaller dimensions.",
      mode,
    );
  }

  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    cubicFeet,
    cubicYards,
    lengthFt,
    widthFt,
    diameterFt,
    depthFt: depth.feet,
    bags: bag.bagCubicFeet === null ? null : bagsForVolume(cubicFeet, bag.bagCubicFeet),
    bagCubicFeet: bag.bagCubicFeet,
  };
}
