export const SURFACES = ["siding", "roof", "concrete", "fence"] as const;
export type SurfaceId = (typeof SURFACES)[number];

export const SOILS = ["light", "medium", "heavy"] as const;
export type SoilId = (typeof SOILS)[number];

export const DEFAULT_STOCK_SH_PERCENT = 12.5;
export const DEFAULT_SURFACTANT_OZ_PER_GAL = 1.5;
export const MIN_SURFACTANT_OZ_PER_GAL = 1;
export const MAX_SURFACTANT_OZ_PER_GAL = 2;

export const SOFT_WASH_LEAD_STORAGE_KEY = "ateamkit:soft-wash-quote-leads";

export const SOFT_WASH_LEAD_SOURCES = [
  "soft-wash-mix-calculator",
  "house-sq-ft-estimator",
  "vinyl-siding-cleanability",
  "roof-algae-severity",
] as const;
export type SoftWashLeadSource = (typeof SOFT_WASH_LEAD_SOURCES)[number];

export function isSoftWashLeadSource(value: string): value is SoftWashLeadSource {
  return (SOFT_WASH_LEAD_SOURCES as readonly string[]).includes(value);
}

export const SURFACE_PRESETS: Record<
  SurfaceId,
  {
    label: string;
    shLow: number;
    shMid: number;
    shHigh: number;
    sqFtPerGallon: number;
    dwellTip: string;
  }
> = {
  siding: {
    label: "Siding",
    shLow: 0.5,
    shMid: 0.75,
    shHigh: 1,
    sqFtPerGallon: 200,
    dwellTip:
      "Dwell about 5–10 minutes. Keep the mix wet. Rinse thoroughly and wet plants before and after.",
  },
  roof: {
    label: "Roof",
    shLow: 10,
    shMid: 12,
    shHigh: 12.5,
    sqFtPerGallon: 100,
    dwellTip:
      "Dwell about 15–20 minutes on a cool surface. Keep the mix wet. Rinse from the top down.",
  },
  concrete: {
    label: "Concrete",
    shLow: 4,
    shMid: 5,
    shHigh: 6,
    sqFtPerGallon: 150,
    dwellTip: "Dwell about 5–15 minutes. Agitate stains if needed, then rinse well.",
  },
  fence: {
    label: "Fence",
    shLow: 0.5,
    shMid: 0.75,
    shHigh: 1,
    sqFtPerGallon: 175,
    dwellTip:
      "Dwell about 5–10 minutes. Rinse thoroughly. Keep runoff off plants and metal hardware.",
  },
};

export function isSurfaceId(value: string): value is SurfaceId {
  return (SURFACES as readonly string[]).includes(value);
}

export function isSoilId(value: string): value is SoilId {
  return (SOILS as readonly string[]).includes(value);
}

export function targetShPercent(surface: SurfaceId, soil: SoilId): number {
  const preset = SURFACE_PRESETS[surface];
  if (soil === "light") return preset.shLow;
  if (soil === "heavy") return preset.shHigh;
  return preset.shMid;
}

export function formatShPercent(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

export function shRangeLabel(surface: SurfaceId): string {
  const preset = SURFACE_PRESETS[surface];
  return `${formatShPercent(preset.shLow)}–${formatShPercent(preset.shHigh)} typical pro range`;
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function roundAmount(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export function resolveWashArea(input: {
  mode: "sqft" | "dimensions";
  sqFt: number;
  lengthFt: number;
  widthFt: number;
  stories: number | null;
}): number | null {
  if (input.mode === "sqft") {
    if (!isFiniteNumber(input.sqFt) || input.sqFt <= 0) return null;
    return input.sqFt;
  }

  if (!isFiniteNumber(input.lengthFt) || input.lengthFt <= 0) return null;
  if (!isFiniteNumber(input.widthFt) || input.widthFt <= 0) return null;
  const stories = input.stories === 2 ? 2 : 1;
  return input.lengthFt * input.widthFt * stories;
}

export type SoftWashMixInput = {
  surface: SurfaceId;
  areaSqFt: number;
  soil: SoilId;
  stockShPercent: number;
  surfactantOzPerGal: number;
};

export type SoftWashMixResult = {
  valid: boolean;
  error: string | null;
  areaSqFt: number | null;
  targetShPercent: number | null;
  shRangeLabel: string | null;
  mixGallons: number | null;
  bleachGallons: number | null;
  waterGallons: number | null;
  surfactantOz: number | null;
  dwellTip: string | null;
  coverageLabel: string | null;
};

const emptyResult: SoftWashMixResult = {
  valid: false,
  error: null,
  areaSqFt: null,
  targetShPercent: null,
  shRangeLabel: null,
  mixGallons: null,
  bleachGallons: null,
  waterGallons: null,
  surfactantOz: null,
  dwellTip: null,
  coverageLabel: null,
};

export function computeSoftWashMix(input: SoftWashMixInput): SoftWashMixResult {
  if (!isSurfaceId(input.surface) || !isSoilId(input.soil)) {
    return { ...emptyResult, error: "Choose a surface and soil level." };
  }

  if (!isFiniteNumber(input.areaSqFt) || input.areaSqFt <= 0) {
    return { ...emptyResult, error: "Enter a square-foot area greater than zero." };
  }

  if (!isFiniteNumber(input.stockShPercent) || input.stockShPercent <= 0) {
    return { ...emptyResult, error: "Stock SH percent must be greater than zero." };
  }

  if (!isFiniteNumber(input.surfactantOzPerGal) || input.surfactantOzPerGal < 0) {
    return { ...emptyResult, error: "Surfactant ounces per gallon cannot be negative." };
  }

  const preset = SURFACE_PRESETS[input.surface];
  const target = targetShPercent(input.surface, input.soil);

  if (input.stockShPercent < target) {
    return {
      ...emptyResult,
      areaSqFt: input.areaSqFt,
      targetShPercent: target,
      shRangeLabel: shRangeLabel(input.surface),
      error:
        "Stock SH is weaker than the target mix. Use a stronger sodium hypochlorite or a lower target.",
    };
  }

  const mixGallons = roundAmount(input.areaSqFt / preset.sqFtPerGallon);
  const bleachGallons = roundAmount(mixGallons * (target / input.stockShPercent));
  const waterGallons = roundAmount(mixGallons - bleachGallons);
  const surfactantOz = roundAmount(mixGallons * input.surfactantOzPerGal);

  return {
    valid: true,
    error: null,
    areaSqFt: input.areaSqFt,
    targetShPercent: target,
    shRangeLabel: shRangeLabel(input.surface),
    mixGallons,
    bleachGallons,
    waterGallons,
    surfactantOz,
    dwellTip: preset.dwellTip,
    coverageLabel: `About ${preset.sqFtPerGallon} sq ft per gallon of mix (educational coverage).`,
  };
}

export type SoftWashLeadInput = {
  name: string;
  phone: string;
  location: string;
  surface: string;
  sqFt: number;
  mixGallons: number | null;
  source: SoftWashLeadSource;
  honeypot?: string;
};

export type SoftWashLead = {
  name: string;
  phone: string;
  location: string;
  surface: SurfaceId;
  sqFt: number;
  mixGallons: number | null;
  source: SoftWashLeadSource;
};

export type SoftWashLeadValidation =
  | { ok: true; lead: SoftWashLead }
  | { ok: false; error: string };

export function validateSoftWashLead(input: SoftWashLeadInput): SoftWashLeadValidation {
  if (input.honeypot && input.honeypot.trim() !== "") {
    return { ok: false, error: "Unable to send this request." };
  }

  const name = input.name.trim();
  const phone = input.phone.trim();
  const location = input.location.trim();

  if (name.length < 2) {
    return { ok: false, error: "Enter your name." };
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return { ok: false, error: "Enter a phone number with at least 7 digits." };
  }
  if (location.length < 2) {
    return { ok: false, error: "Enter a ZIP code or city." };
  }
  if (!isSurfaceId(input.surface)) {
    return { ok: false, error: "Choose a surface." };
  }
  if (!isFiniteNumber(input.sqFt) || input.sqFt <= 0) {
    return { ok: false, error: "Enter square feet greater than zero." };
  }
  if (!isSoftWashLeadSource(input.source)) {
    return { ok: false, error: "Unable to send this request." };
  }

  return {
    ok: true,
    lead: {
      name,
      phone,
      location,
      surface: input.surface,
      sqFt: input.sqFt,
      mixGallons:
        input.mixGallons !== null && isFiniteNumber(input.mixGallons)
          ? input.mixGallons
          : null,
      source: input.source,
    },
  };
}

export function formatSoftWashLeadText(lead: SoftWashLead): string {
  const mix =
    lead.mixGallons === null
      ? "n/a"
      : `${lead.mixGallons.toLocaleString(undefined, { maximumFractionDigits: 2 })} gal`;
  return [
    "Soft wash quote request",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `ZIP/city: ${lead.location}`,
    `Surface: ${SURFACE_PRESETS[lead.surface].label}`,
    `Square feet: ${lead.sqFt.toLocaleString()}`,
    `Mix gallons (estimate): ${mix}`,
    `Source: ${lead.source}`,
  ].join("\n");
}

export function getLeadFormEndpoint(): string {
  return (process.env.NEXT_PUBLIC_LEAD_FORM_ENDPOINT ?? "").trim();
}

export function buildSoftWashLeadMailto(lead: SoftWashLead): string {
  const subject = encodeURIComponent("Soft wash quote request");
  const body = encodeURIComponent(formatSoftWashLeadText(lead));
  return `mailto:?subject=${subject}&body=${body}`;
}

export function readStoredSoftWashLeads(raw: string | null): SoftWashLead[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SoftWashLead => {
      if (!item || typeof item !== "object") return false;
      const row = item as SoftWashLead;
      return (
        typeof row.name === "string" &&
        typeof row.phone === "string" &&
        typeof row.location === "string" &&
        isSurfaceId(row.surface) &&
        typeof row.sqFt === "number"
      );
    });
  } catch {
    return [];
  }
}
