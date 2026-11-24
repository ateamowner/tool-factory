export type RoofPitchInput = {
  rise: number;
  run: number;
};

export type RoofPitchResult =
  | { valid: false; error: string }
  | {
      valid: true;
      /** Rise per 12 units of run, e.g. 6 for a 6/12 roof. */
      pitchPer12: number;
      angleDegrees: number;
      slopePercent: number;
      /** Rafter length per 1 unit of run (hypotenuse factor). */
      rafterMultiplier: number;
      /** Sloped rafter length for the run entered, same unit as the inputs. */
      rafterLength: number;
      /** Roof surface area factor per 1 unit of flat plan area. */
      areaFactor: number;
    };

export function computeRoofPitch(input: RoofPitchInput): RoofPitchResult {
  const { rise, run } = input;
  if (!Number.isFinite(rise) || !Number.isFinite(run)) {
    return { valid: false, error: "Enter a rise and a run." };
  }
  if (rise < 0) return { valid: false, error: "Rise cannot be negative." };
  if (run <= 0) return { valid: false, error: "Run must be greater than zero." };
  const ratio = rise / run;
  const rafterMultiplier = Math.sqrt(1 + ratio * ratio);
  return {
    valid: true,
    pitchPer12: ratio * 12,
    angleDegrees: (Math.atan(ratio) * 180) / Math.PI,
    slopePercent: ratio * 100,
    rafterMultiplier,
    rafterLength: run * rafterMultiplier,
    areaFactor: rafterMultiplier,
  };
}

/** Convert an angle in degrees to rise per 12 of run. */
export function pitchFromAngle(degrees: number): number | null {
  if (!Number.isFinite(degrees) || degrees < 0 || degrees >= 90) return null;
  return Math.tan((degrees * Math.PI) / 180) * 12;
}

export const COMMON_PITCHES: { pitch: number; label: string }[] = [
  { pitch: 2, label: "Low slope" },
  { pitch: 3, label: "Low slope" },
  { pitch: 4, label: "Low to conventional" },
  { pitch: 5, label: "Conventional" },
  { pitch: 6, label: "Conventional" },
  { pitch: 7, label: "Conventional" },
  { pitch: 8, label: "Steep" },
  { pitch: 9, label: "Steep" },
  { pitch: 10, label: "Steep" },
  { pitch: 12, label: "Very steep" },
];

export function formatPitch(pitchPer12: number): string {
  const rounded = Math.round(pitchPer12 * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(2).replace(/0+$/, "")}/12`;
}
