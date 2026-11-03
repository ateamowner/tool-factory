/** Parse a user-entered number, allowing commas and spaces. Blank returns 0; invalid returns null. */
function parseNumberInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Typical residential limits (IRC-style). Labeled as typical, not local code. */
export const TYPICAL_MAX_RISER_IN = 7.75;
export const TYPICAL_MIN_TREAD_IN = 10;

export type StairInput = {
  totalRiseIn: string;
  maxRiserIn: string;
  treadDepthIn: string;
};

export type StairResult =
  | {
      valid: true;
      totalRiseIn: number;
      risers: number;
      treads: number;
      riserHeightIn: number;
      treadDepthIn: number;
      totalRunIn: number;
      stringerLengthIn: number;
      angleDeg: number;
      comfortSum: number;
      warnings: string[];
    }
  | { valid: false; error: string };

/** Number of risers so no riser is taller than the max. */
export function riserCount(totalRiseIn: number, maxRiserIn: number): number {
  if (!(totalRiseIn > 0) || !(maxRiserIn > 0)) return 0;
  return Math.ceil(totalRiseIn / maxRiserIn - 1e-9);
}

export function stairAngleDeg(riserIn: number, treadIn: number): number {
  if (!(riserIn > 0) || !(treadIn > 0)) return 0;
  return (Math.atan(riserIn / treadIn) * 180) / Math.PI;
}

export function computeStairs(input: StairInput): StairResult {
  const rise = parseNumberInput(input.totalRiseIn);
  const maxRiser = parseNumberInput(input.maxRiserIn);
  const tread = parseNumberInput(input.treadDepthIn);
  if (rise === null || maxRiser === null || tread === null) {
    return { valid: false, error: "Enter numbers only." };
  }
  if (!(rise > 0)) return { valid: false, error: "Enter the total rise, floor to floor, in inches." };
  if (!(maxRiser > 0)) return { valid: false, error: "Enter a maximum riser height above 0." };
  if (!(tread > 0)) return { valid: false, error: "Enter a tread depth above 0." };
  if (rise > 600) return { valid: false, error: "Total rise looks too tall for one flight. Enter it in inches." };

  const risers = riserCount(rise, maxRiser);
  const treads = Math.max(risers - 1, 0);
  const riserHeightIn = rise / risers;
  const totalRunIn = treads * tread;
  const stringerLengthIn = Math.sqrt(rise * rise + totalRunIn * totalRunIn);
  const angleDeg = stairAngleDeg(riserHeightIn, tread);
  const comfortSum = 2 * riserHeightIn + tread;

  const warnings: string[] = [];
  if (riserHeightIn > TYPICAL_MAX_RISER_IN + 1e-9) {
    warnings.push(`Riser height is over the typical ${TYPICAL_MAX_RISER_IN} in residential max.`);
  }
  if (tread < TYPICAL_MIN_TREAD_IN - 1e-9) {
    warnings.push(`Tread depth is under the typical ${TYPICAL_MIN_TREAD_IN} in residential minimum.`);
  }
  if (comfortSum < 24 || comfortSum > 25.5) {
    warnings.push("2 risers + 1 tread falls outside the 24–25 in comfort range, so the stairs may feel steep or shallow.");
  }

  return {
    valid: true,
    totalRiseIn: rise,
    risers,
    treads,
    riserHeightIn,
    treadDepthIn: tread,
    totalRunIn,
    stringerLengthIn,
    angleDeg,
    comfortSum,
    warnings,
  };
}

/** Format inches as feet and inches to the nearest 1/16 in, e.g. 9 ft 2 3/8 in. */
export function formatFeetInches(totalIn: number): string {
  if (!Number.isFinite(totalIn) || totalIn <= 0) return "0 in";
  let sixteenths = Math.round(totalIn * 16);
  const feet = Math.floor(sixteenths / (12 * 16));
  sixteenths -= feet * 12 * 16;
  const inches = Math.floor(sixteenths / 16);
  let frac = sixteenths - inches * 16;
  let fracText = "";
  if (frac > 0) {
    let den = 16;
    while (frac % 2 === 0) {
      frac /= 2;
      den /= 2;
    }
    fracText = ` ${frac}/${den}`;
  }
  const inchText = `${inches}${fracText} in`;
  return feet > 0 ? `${feet} ft ${inchText}` : inchText;
}
