/** One roofing square covers 100 square feet of roof surface. */
export const SQ_FT_PER_ROOFING_SQUARE = 100;

/** Educational default waste. Callers may override with 0–100. */
export const DEFAULT_WASTE_PERCENT = 10;

export const ROOF_AREA_MODES = ["dimensions", "plan"] as const;
export type RoofAreaMode = (typeof ROOF_AREA_MODES)[number];

export const PITCH_INPUT_MODES = ["preset", "rise", "factor"] as const;
export type PitchInputMode = (typeof PITCH_INPUT_MODES)[number];

export const PITCH_PRESETS = [
  { id: "flat", label: "Flat", rise: 0 },
  { id: "4/12", label: "4/12", rise: 4 },
  { id: "6/12", label: "6/12", rise: 6 },
  { id: "8/12", label: "8/12", rise: 8 },
  { id: "12/12", label: "12/12", rise: 12 },
] as const;

export type PitchPresetId = (typeof PITCH_PRESETS)[number]["id"];

export type RoofingStatus = "ok" | "invalid" | "value_required";

export type RoofingInput = {
  mode: RoofAreaMode;
  lengthFt: number;
  widthFt: number;
  planSqFt: number;
  pitchMode: PitchInputMode;
  presetId: PitchPresetId;
  /** Rise in a rise/12 pitch. Run is always 12. */
  rise: number;
  /** Direct multiplier. 1 means the surface equals the plan area. */
  pitchFactor: number;
  wastePercent: number;
  /** Null skips the optional material-cost line. */
  pricePerSquare: number | null;
};

export type RoofingResult = {
  status: RoofingStatus;
  valid: boolean;
  error: string | null;
  mode: RoofAreaMode;
  planSqFt: number | null;
  lengthFt: number | null;
  widthFt: number | null;
  pitchLabel: string | null;
  pitchFactor: number | null;
  surfaceSqFt: number | null;
  squares: number | null;
  wastePercent: number | null;
  adjustedSqFt: number | null;
  adjustedSquares: number | null;
  pricePerSquare: number | null;
  materialCost: number | null;
};

const emptyResult = (
  status: RoofingStatus,
  error: string,
  mode: RoofAreaMode,
): RoofingResult => ({
  status,
  valid: false,
  error,
  mode,
  planSqFt: null,
  lengthFt: null,
  widthFt: null,
  pitchLabel: null,
  pitchFactor: null,
  surfaceSqFt: null,
  squares: null,
  wastePercent: null,
  adjustedSqFt: null,
  adjustedSquares: null,
  pricePerSquare: null,
  materialCost: null,
});

/** Strip thousands separators. Empty input is NaN so callers can reject it. */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

/**
 * Pitch factor for an X/12 pitch.
 * surface ≈ plan × sqrt(1 + (rise/12)^2)
 */
export function pitchFactorFromRise(rise: number, run = 12): number {
  return Math.sqrt(1 + (rise / run) ** 2);
}

export function formatSqFt(value: number): string {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
  return `${formatted} sq ft`;
}

export function formatSquares(value: number): string {
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} squares`;
}

export function formatFactor(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

type NumberRead =
  | { ok: true }
  | { ok: false; status: RoofingStatus; error: string };

function readPositive(value: number, label: string): NumberRead {
  if (!isFiniteNumber(value)) {
    return {
      ok: false,
      status: "invalid",
      error: `Enter a finite ${label} greater than 0.`,
    };
  }
  if (value <= 0) {
    return {
      ok: false,
      status: "value_required",
      error: `Enter a ${label} greater than 0.`,
    };
  }
  return { ok: true };
}

type PitchRead =
  | { ok: true; factor: number; label: string }
  | { ok: false; status: RoofingStatus; error: string };

function readPitch(input: RoofingInput): PitchRead {
  if (!PITCH_INPUT_MODES.includes(input.pitchMode)) {
    return {
      ok: false,
      status: "invalid",
      error: "Choose a common pitch, a rise/12 pitch, or a pitch factor.",
    };
  }

  if (input.pitchMode === "preset") {
    const preset = PITCH_PRESETS.find((item) => item.id === input.presetId);
    if (!preset) {
      return {
        ok: false,
        status: "invalid",
        error: "Choose a flat roof or a 4/12, 6/12, 8/12, or 12/12 pitch.",
      };
    }
    const label = preset.id === "flat" ? "Flat (0/12)" : preset.label;
    return { ok: true, factor: pitchFactorFromRise(preset.rise), label };
  }

  if (input.pitchMode === "rise") {
    if (!isFiniteNumber(input.rise)) {
      return {
        ok: false,
        status: "invalid",
        error: "Enter a finite rise from 0 to 24 for an X/12 pitch.",
      };
    }
    if (input.rise < 0 || input.rise > 24) {
      return {
        ok: false,
        status: "value_required",
        error: "Enter a rise from 0 to 24 for an X/12 pitch.",
      };
    }
    const riseLabel = Number.isInteger(input.rise)
      ? String(input.rise)
      : input.rise.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return {
      ok: true,
      factor: pitchFactorFromRise(input.rise),
      label: `${riseLabel}/12`,
    };
  }

  if (!isFiniteNumber(input.pitchFactor)) {
    return {
      ok: false,
      status: "invalid",
      error: "Enter a finite pitch factor from 1 to 3. A factor of 1 is a flat roof.",
    };
  }
  if (input.pitchFactor < 1 || input.pitchFactor > 3) {
    return {
      ok: false,
      status: "value_required",
      error: "Enter a pitch factor from 1 to 3. A factor of 1 is a flat roof.",
    };
  }
  return {
    ok: true,
    factor: input.pitchFactor,
    label: `factor ${formatFactor(input.pitchFactor)}`,
  };
}

export function calculateRoofing(input: RoofingInput): RoofingResult {
  if (!ROOF_AREA_MODES.includes(input.mode)) {
    return emptyResult("invalid", "Choose length × width or a plan area.", input.mode);
  }

  let planSqFt: number;
  let lengthFt: number | null = null;
  let widthFt: number | null = null;

  if (input.mode === "dimensions") {
    const lengthRead = readPositive(input.lengthFt, "length in feet");
    if (!lengthRead.ok) return emptyResult(lengthRead.status, lengthRead.error, input.mode);
    const widthRead = readPositive(input.widthFt, "width in feet");
    if (!widthRead.ok) return emptyResult(widthRead.status, widthRead.error, input.mode);
    lengthFt = input.lengthFt;
    widthFt = input.widthFt;
    planSqFt = input.lengthFt * input.widthFt;
  } else {
    const planRead = readPositive(input.planSqFt, "plan area in square feet");
    if (!planRead.ok) return emptyResult(planRead.status, planRead.error, input.mode);
    planSqFt = input.planSqFt;
  }

  const pitch = readPitch(input);
  if (!pitch.ok) return emptyResult(pitch.status, pitch.error, input.mode);

  if (!isFiniteNumber(input.wastePercent)) {
    return emptyResult(
      "invalid",
      "Enter a finite waste percent from 0 to 100. 10% is a common educational default.",
      input.mode,
    );
  }
  if (input.wastePercent < 0 || input.wastePercent > 100) {
    return emptyResult(
      "value_required",
      "Enter a waste percent from 0 to 100. 10% is a common educational default.",
      input.mode,
    );
  }

  let pricePerSquare: number | null = null;
  if (input.pricePerSquare !== null) {
    if (!isFiniteNumber(input.pricePerSquare)) {
      return emptyResult(
        "invalid",
        "Enter a finite price per square of 0 or more, or leave it blank.",
        input.mode,
      );
    }
    if (input.pricePerSquare < 0) {
      return emptyResult(
        "value_required",
        "Enter a price per square of 0 or more, or leave it blank.",
        input.mode,
      );
    }
    pricePerSquare = input.pricePerSquare;
  }

  const surfaceSqFt = planSqFt * pitch.factor;
  const squares = surfaceSqFt / SQ_FT_PER_ROOFING_SQUARE;
  const wasteMultiplier = 1 + input.wastePercent / 100;
  const adjustedSqFt = surfaceSqFt * wasteMultiplier;
  const adjustedSquares = squares * wasteMultiplier;
  const materialCost = pricePerSquare === null ? null : adjustedSquares * pricePerSquare;

  return {
    status: "ok",
    valid: true,
    error: null,
    mode: input.mode,
    planSqFt,
    lengthFt,
    widthFt,
    pitchLabel: pitch.label,
    pitchFactor: pitch.factor,
    surfaceSqFt,
    squares,
    wastePercent: input.wastePercent,
    adjustedSqFt,
    adjustedSquares,
    pricePerSquare,
    materialCost,
  };
}
