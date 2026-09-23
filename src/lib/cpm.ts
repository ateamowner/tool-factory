export const IMPRESSIONS_PER_MILLE = 1000;

export type CpmMode = "cpm" | "cost" | "impressions" | "cpc_ctr";

export type CpmStatus = "ok" | "invalid" | "value_required";

export type CpmInput = {
  mode: CpmMode;
  cost: number;
  impressions: number;
  cpm: number;
  /** Null skips the optional click helper (CPC and CTR). */
  clicks: number | null;
  cpc: number;
  /** Click-through rate as a percent. 2 means 2%, not 2.00 as a ratio. */
  ctrPercent: number;
};

export type CpmResult = {
  status: CpmStatus;
  valid: boolean;
  error: string | null;
  mode: CpmMode;
  cost: number | null;
  impressions: number | null;
  cpm: number | null;
  clicks: number | null;
  cpc: number | null;
  ctrPercent: number | null;
};

const MODES: CpmMode[] = ["cpm", "cost", "impressions", "cpc_ctr"];

const emptyResult = (status: CpmStatus, error: string, mode: CpmMode): CpmResult => ({
  status,
  valid: false,
  error,
  mode,
  cost: null,
  impressions: null,
  cpm: null,
  clicks: null,
  cpc: null,
  ctrPercent: null,
});

/** Strip thousands separators. Empty input is NaN so callers can reject it. */
export function parseCpmAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

/** CPM = (cost / impressions) × 1,000. Impressions must be greater than 0. */
export function cpmFromCost(cost: number, impressions: number): number {
  return (cost / impressions) * IMPRESSIONS_PER_MILLE;
}

/** Cost = (CPM × impressions) / 1,000. */
export function costFromCpm(cpm: number, impressions: number): number {
  return (cpm * impressions) / IMPRESSIONS_PER_MILLE;
}

/** Impressions = (cost / CPM) × 1,000. CPM must be greater than 0. */
export function impressionsFromCost(cost: number, cpm: number): number {
  return (cost / cpm) * IMPRESSIONS_PER_MILLE;
}

/**
 * CPM from CPC and CTR percent.
 * CTR 2 means 2% (0.02). CPM = CPC × (CTR / 100) × 1,000, which is CPC × CTR% × 10.
 */
export function cpmFromCpcCtr(cpc: number, ctrPercent: number): number {
  return cpc * (ctrPercent / 100) * IMPRESSIONS_PER_MILLE;
}

/** CPC = cost / clicks. Clicks must be greater than 0. */
export function cpcFromCost(cost: number, clicks: number): number {
  return cost / clicks;
}

/** CTR percent = (clicks / impressions) × 100. */
export function ctrPercentFromClicks(clicks: number, impressions: number): number {
  return (clicks / impressions) * 100;
}

export function formatMoney(value: number): string {
  const abs = Math.abs(value);
  const maximumFractionDigits = abs !== 0 && abs < 0.01 ? 4 : 2;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
}

export function formatCount(value: number): string {
  const nearest = Math.round(value);
  const digits = Math.abs(value - nearest) < 1e-6 ? 0 : 2;
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function formatCtr(percent: number): string {
  const formatted = percent.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: Number.isInteger(percent) ? 0 : 2,
  });
  return `${formatted}%`;
}

type AmountRead =
  | { ok: true; value: number }
  | { ok: false; status: CpmStatus; error: string };

function labelName(label: string): string {
  return `${label[0]?.toUpperCase() ?? ""}${label.slice(1)}`;
}

function readNonNegative(value: number, label: string): AmountRead {
  if (!Number.isFinite(value)) {
    return {
      ok: false,
      status: "invalid",
      error: `Enter a finite ${label} of 0 or more. Empty and infinite values are not used.`,
    };
  }

  if (value < 0) {
    return {
      ok: false,
      status: "value_required",
      error: `${labelName(label)} must be 0 or more.`,
    };
  }

  return { ok: true, value };
}

function readPositive(value: number, label: string, reason: string): AmountRead {
  if (!Number.isFinite(value)) {
    return {
      ok: false,
      status: "invalid",
      error: `Enter a finite ${label} greater than 0. Empty and infinite values are not used.`,
    };
  }

  if (value <= 0) {
    return {
      ok: false,
      status: "value_required",
      error: `${labelName(label)} must be greater than 0. ${reason}`,
    };
  }

  return { ok: true, value };
}

function readClicks(
  clicks: number | null,
): { ok: true; value: number | null } | { ok: false; status: CpmStatus; error: string } {
  if (clicks === null) return { ok: true, value: null };

  if (!Number.isFinite(clicks)) {
    return {
      ok: false,
      status: "invalid",
      error: "Enter a finite click count greater than 0, or leave clicks blank.",
    };
  }

  if (clicks <= 0) {
    return {
      ok: false,
      status: "value_required",
      error: "Clicks must be greater than 0 to calculate CPC and CTR, or leave clicks blank.",
    };
  }

  return { ok: true, value: clicks };
}

function finiteOrTooLarge(
  mode: CpmMode,
  values: number[],
): CpmResult | null {
  if (values.every((value) => Number.isFinite(value))) return null;
  return emptyResult(
    "invalid",
    "That result is too large to calculate. Enter smaller numbers.",
    mode,
  );
}

export function calculateCpm(input: CpmInput): CpmResult {
  const mode = input.mode;
  if (!MODES.includes(mode)) {
    return emptyResult("invalid", "Choose a CPM calculation mode.", "cpm");
  }

  if (mode === "cpm") {
    const cost = readNonNegative(input.cost, "cost");
    if (!cost.ok) return emptyResult(cost.status, cost.error, mode);
    const impressions = readPositive(
      input.impressions,
      "impressions",
      "CPM divides cost by impressions, then multiplies by 1,000.",
    );
    if (!impressions.ok) return emptyResult(impressions.status, impressions.error, mode);
    const clicks = readClicks(input.clicks);
    if (!clicks.ok) return emptyResult(clicks.status, clicks.error, mode);

    const cpm = cpmFromCost(cost.value, impressions.value);
    const cpc = clicks.value === null ? null : cpcFromCost(cost.value, clicks.value);
    const ctrPercent =
      clicks.value === null ? null : ctrPercentFromClicks(clicks.value, impressions.value);
    const overflow = finiteOrTooLarge(
      mode,
      [cpm, ...(cpc === null ? [] : [cpc]), ...(ctrPercent === null ? [] : [ctrPercent])],
    );
    if (overflow) return overflow;

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      cost: cost.value,
      impressions: impressions.value,
      cpm,
      clicks: clicks.value,
      cpc,
      ctrPercent,
    };
  }

  if (mode === "cost") {
    const cpm = readNonNegative(input.cpm, "CPM");
    if (!cpm.ok) return emptyResult(cpm.status, cpm.error, mode);
    const impressions = readNonNegative(input.impressions, "impressions");
    if (!impressions.ok) return emptyResult(impressions.status, impressions.error, mode);

    const cost = costFromCpm(cpm.value, impressions.value);
    const overflow = finiteOrTooLarge(mode, [cost]);
    if (overflow) return overflow;

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      cost,
      impressions: impressions.value,
      cpm: cpm.value,
      clicks: null,
      cpc: null,
      ctrPercent: null,
    };
  }

  if (mode === "impressions") {
    const cost = readNonNegative(input.cost, "cost");
    if (!cost.ok) return emptyResult(cost.status, cost.error, mode);
    const cpm = readPositive(
      input.cpm,
      "CPM",
      "Impressions are cost divided by CPM, times 1,000.",
    );
    if (!cpm.ok) return emptyResult(cpm.status, cpm.error, mode);

    const impressions = impressionsFromCost(cost.value, cpm.value);
    const overflow = finiteOrTooLarge(mode, [impressions]);
    if (overflow) return overflow;

    return {
      status: "ok",
      valid: true,
      error: null,
      mode,
      cost: cost.value,
      impressions,
      cpm: cpm.value,
      clicks: null,
      cpc: null,
      ctrPercent: null,
    };
  }

  const cpc = readNonNegative(input.cpc, "CPC");
  if (!cpc.ok) return emptyResult(cpc.status, cpc.error, mode);
  const ctrPercent = readNonNegative(input.ctrPercent, "CTR");
  if (!ctrPercent.ok) return emptyResult(ctrPercent.status, ctrPercent.error, mode);

  const cpm = cpmFromCpcCtr(cpc.value, ctrPercent.value);
  const overflow = finiteOrTooLarge(mode, [cpm]);
  if (overflow) return overflow;

  return {
    status: "ok",
    valid: true,
    error: null,
    mode,
    cost: null,
    impressions: null,
    cpm,
    clicks: null,
    cpc: cpc.value,
    ctrPercent: ctrPercent.value,
  };
}
