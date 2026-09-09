export const SIDING_KINDS = ["vinyl", "fiber-cement", "wood", "other"] as const;
export type SidingKind = (typeof SIDING_KINDS)[number];

export const CLEANABILITY_SOILS = ["algae", "oxidation", "dirt"] as const;
export type CleanabilitySoil = (typeof CLEANABILITY_SOILS)[number];

export const SIDING_AGE_BANDS = ["0-10", "10-20", "20+"] as const;
export type SidingAgeBand = (typeof SIDING_AGE_BANDS)[number];

export const FIT_SCORES = ["good", "caution", "skip"] as const;
export type FitScore = (typeof FIT_SCORES)[number];

export const SIDING_KIND_LABELS: Record<SidingKind, string> = {
  vinyl: "Vinyl",
  "fiber-cement": "Fiber cement",
  wood: "Wood",
  other: "Other",
};

export const CLEANABILITY_SOIL_LABELS: Record<CleanabilitySoil, string> = {
  algae: "Algae",
  oxidation: "Oxidation / chalking",
  dirt: "Dirt / film",
};

export const SIDING_AGE_LABELS: Record<SidingAgeBand, string> = {
  "0-10": "0–10 years",
  "10-20": "10–20 years",
  "20+": "20+ years",
};

export function isSidingKind(value: string): value is SidingKind {
  return (SIDING_KINDS as readonly string[]).includes(value);
}

export function isCleanabilitySoil(value: string): value is CleanabilitySoil {
  return (CLEANABILITY_SOILS as readonly string[]).includes(value);
}

export function isSidingAgeBand(value: string): value is SidingAgeBand {
  return (SIDING_AGE_BANDS as readonly string[]).includes(value);
}

export type CleanabilityResult = {
  valid: boolean;
  error: string | null;
  fit: FitScore | null;
  why: string | null;
};

const emptyResult: CleanabilityResult = {
  valid: false,
  error: null,
  fit: null,
  why: null,
};

export function scoreVinylCleanability(input: {
  siding: SidingKind;
  soil: CleanabilitySoil;
  age: SidingAgeBand;
  shade: boolean;
}): CleanabilityResult {
  if (!isSidingKind(input.siding) || !isCleanabilitySoil(input.soil) || !isSidingAgeBand(input.age)) {
    return { ...emptyResult, error: "Choose siding type, soil, and age band." };
  }

  if (input.siding === "wood") {
    return {
      valid: true,
      error: null,
      fit: "skip",
      why: "Wood is not a typical sodium-hypochlorite soft-wash surface. Bleach mixes can raise grain, fade finishes, and leave the wood needing a different process.",
    };
  }

  if (input.siding === "other") {
    return {
      valid: true,
      error: null,
      fit: "caution",
      why: "Unknown cladding needs a material-specific check. Soft-wash talk online is mostly about vinyl biological growth, not every siding product.",
    };
  }

  if (input.siding === "fiber-cement") {
    return {
      valid: true,
      error: null,
      fit: "caution",
      why: "Fiber-cement makers often publish their own wash limits. This page does not treat fiber cement as a default soft-wash surface.",
    };
  }

  if (input.soil === "oxidation") {
    return {
      valid: true,
      error: null,
      fit: "caution",
      why: "Chalking or color fade on vinyl is a different problem than algae. A wash may clean film and still not restore the original color.",
    };
  }

  if (input.soil === "dirt" && input.age === "20+") {
    return {
      valid: true,
      error: null,
      fit: "caution",
      why: "Ordinary dirt on vinyl is often discussed as washable, but 20+ year panels can be more brittle and more oxidized than they look.",
    };
  }

  const shadeNote = input.shade
    ? " Shade that stays damp is a common place people notice green film."
    : "";

  if (input.soil === "algae") {
    return {
      valid: true,
      error: null,
      fit: "good",
      why: `Algae on vinyl is the most common educational example of a soft-wash conversation.${shadeNote} This is not a bid or a promise that a wash is safe on your house.`,
    };
  }

  return {
    valid: true,
    error: null,
    fit: "good",
    why: `Vinyl with ordinary dirt or film is a usual educational example of a house-wash conversation.${shadeNote} Follow the panel maker’s guidance.`,
  };
}
