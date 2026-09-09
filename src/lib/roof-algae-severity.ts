export const STREAK_COVERAGES = ["none", "light", "bands", "heavy"] as const;
export type StreakCoverage = (typeof STREAK_COVERAGES)[number];

export const ROOF_AGE_BANDS = ["0-10", "10-20", "20+"] as const;
export type RoofAgeBand = (typeof ROOF_AGE_BANDS)[number];

export const STREAK_COVERAGE_LABELS: Record<StreakCoverage, string> = {
  none: "None",
  light: "Light specks",
  bands: "Visible bands",
  heavy: "Heavy / widespread",
};

export const ROOF_AGE_LABELS: Record<RoofAgeBand, string> = {
  "0-10": "0–10 years",
  "10-20": "10–20 years",
  "20+": "20+ years",
};

export function isStreakCoverage(value: string): value is StreakCoverage {
  return (STREAK_COVERAGES as readonly string[]).includes(value);
}

export function isRoofAgeBand(value: string): value is RoofAgeBand {
  return (ROOF_AGE_BANDS as readonly string[]).includes(value);
}

export type RoofAlgaeSeverity = 1 | 2 | 3 | 4;

export type RoofAlgaeResult = {
  valid: boolean;
  error: string | null;
  severity: RoofAlgaeSeverity | null;
  typicalCandidate: boolean;
  note: string | null;
};

const emptyResult: RoofAlgaeResult = {
  valid: false,
  error: null,
  severity: null,
  typicalCandidate: false,
  note: null,
};

const coverageBase: Record<StreakCoverage, RoofAlgaeSeverity> = {
  none: 1,
  light: 2,
  bands: 3,
  heavy: 4,
};

const severityNotes: Record<RoofAlgaeSeverity, string> = {
  1: "Little or no visible streaking from these answers. Not a typical soft-wash candidate from appearance alone. This is not a diagnosis.",
  2: "Light staining. People often watch it; some look up a wash. Typical soft-wash candidate from appearance only — not a diagnosis or a bid.",
  3: "Distinct bands. A common reason people look up roof soft wash. Typical soft-wash candidate from appearance only — not a diagnosis.",
  4: "Heavy or widespread appearance, or lighter streaks plus age or shade factors. Typical soft-wash candidate from appearance only — not a diagnosis.",
};

function clampSeverity(value: number): RoofAlgaeSeverity {
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  return 4;
}

export function scoreRoofAlgae(input: {
  coverage: StreakCoverage;
  age: RoofAgeBand;
  treeCover: boolean;
  northFace: boolean;
}): RoofAlgaeResult {
  if (!isStreakCoverage(input.coverage) || !isRoofAgeBand(input.age)) {
    return { ...emptyResult, error: "Choose streak coverage and roof age." };
  }

  if (input.coverage === "none") {
    return {
      valid: true,
      error: null,
      severity: 1,
      typicalCandidate: false,
      note: severityNotes[1],
    };
  }

  let severity: number = coverageBase[input.coverage];
  if (input.age === "20+" && severity < 4) {
    severity += 1;
  }
  if (input.coverage === "light" && input.treeCover && input.northFace && severity < 4) {
    severity += 1;
  }

  const level = clampSeverity(severity);
  return {
    valid: true,
    error: null,
    severity: level,
    typicalCandidate: level >= 2,
    note: severityNotes[level],
  };
}
