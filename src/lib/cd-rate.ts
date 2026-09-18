export type CdRateMode = "apy" | "nominal";
export type CdTermUnit = "years" | "months";
export type CdCompounding =
  | "daily"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual"
  | "continuous";

export const COMPOUNDING_PERIODS = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
} as const;

export const MAX_DEPOSIT = 1_000_000_000_000;
export const MAX_RATE_PERCENT = 100;
export const MAX_YEARS = 50;
export const MAX_MONTHS = MAX_YEARS * 12;

export const COMPOUNDING_OPTIONS: { id: CdCompounding; label: string }[] = [
  { id: "daily", label: "Daily (365)" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "semiannual", label: "Semiannual" },
  { id: "annual", label: "Annual" },
  { id: "continuous", label: "Continuous" },
];

export type CdRateInput = {
  deposit: number;
  ratePercent: number;
  mode: CdRateMode;
  term: number;
  termUnit: CdTermUnit;
  compounding: CdCompounding;
};

export type CdScheduleRow = {
  year: number;
  yearFraction: number;
  beginningBalance: number;
  interest: number;
  endingBalance: number;
};

export type CdRateStatus = "ok" | "invalid";

export type CdRateResult = {
  status: CdRateStatus;
  valid: boolean;
  error: string | null;
  deposit: number | null;
  years: number | null;
  term: number | null;
  termUnit: CdTermUnit | null;
  compounding: CdCompounding | null;
  periodsPerYear: number | null;
  periodCount: number | null;
  apyPercent: number | null;
  nominalPercent: number | null;
  endingBalance: number | null;
  interestEarned: number | null;
  effectiveYieldPercent: number | null;
  schedule: CdScheduleRow[];
  summary: string | null;
};

const emptyResult = (error: string): CdRateResult => ({
  status: "invalid",
  valid: false,
  error,
  deposit: null,
  years: null,
  term: null,
  termUnit: null,
  compounding: null,
  periodsPerYear: null,
  periodCount: null,
  apyPercent: null,
  nominalPercent: null,
  endingBalance: null,
  interestEarned: null,
  effectiveYieldPercent: null,
  schedule: [],
  summary: null,
});

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function isCdCompounding(value: string): value is CdCompounding {
  return COMPOUNDING_OPTIONS.some((option) => option.id === value);
}

export function compoundingLabel(compounding: CdCompounding): string {
  return COMPOUNDING_OPTIONS.find((option) => option.id === compounding)?.label ?? compounding;
}

export function periodsPerYear(compounding: CdCompounding): number | null {
  if (compounding === "continuous") return null;
  return COMPOUNDING_PERIODS[compounding];
}

export function yearsFromTerm(term: number, termUnit: CdTermUnit): number {
  return termUnit === "months" ? term / 12 : term;
}

/** APY as a decimal from a nominal annual rate and compounding convention. */
export function apyFromNominal(nominalDecimal: number, compounding: CdCompounding): number {
  if (compounding === "annual") return nominalDecimal;
  if (compounding === "continuous") {
    return Math.exp(nominalDecimal) - 1;
  }
  const n = COMPOUNDING_PERIODS[compounding];
  return (1 + nominalDecimal / n) ** n - 1;
}

/** Nominal annual rate as a decimal that produces the given APY. */
export function nominalFromApy(apyDecimal: number, compounding: CdCompounding): number {
  if (compounding === "annual") return apyDecimal;
  if (compounding === "continuous") {
    return Math.log(1 + apyDecimal);
  }
  const n = COMPOUNDING_PERIODS[compounding];
  return n * ((1 + apyDecimal) ** (1 / n) - 1);
}

export function endingFromApy(deposit: number, apyDecimal: number, years: number): number {
  return deposit * (1 + apyDecimal) ** years;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}%`;
}

function formatTermLabel(term: number, termUnit: CdTermUnit, years: number): string {
  if (termUnit === "months") {
    const months = term === 1 ? "1 month" : `${formatPlainNumber(term)} months`;
    if (years === 1) return `${months} (1 year)`;
    return `${months} (${formatPlainNumber(years)} years)`;
  }
  if (term === 1) return "1 year";
  return `${formatPlainNumber(term)} years`;
}

function formatPlainNumber(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
}

export function formatCdSummary(input: {
  deposit: number;
  endingBalance: number;
  interestEarned: number;
  apyPercent: number;
  years: number;
  term: number;
  termUnit: CdTermUnit;
  compounding: CdCompounding;
}): string {
  const termLabel = formatTermLabel(input.term, input.termUnit, input.years);
  return `${formatUsd(input.deposit)} at ${formatPercent(input.apyPercent)} APY for ${termLabel} (${compoundingLabel(input.compounding).toLowerCase()} compounding) grows to ${formatUsd(input.endingBalance)} — ${formatUsd(input.interestEarned)} interest earned.`;
}

export function buildCdSchedule(
  deposit: number,
  apyDecimal: number,
  years: number,
): CdScheduleRow[] {
  const schedule: CdScheduleRow[] = [];
  const fullYears = Math.floor(years);
  const leftover = years - fullYears;

  for (let year = 1; year <= fullYears; year += 1) {
    const beginningBalance = endingFromApy(deposit, apyDecimal, year - 1);
    const endingBalance = endingFromApy(deposit, apyDecimal, year);
    schedule.push({
      year,
      yearFraction: 1,
      beginningBalance,
      interest: endingBalance - beginningBalance,
      endingBalance,
    });
  }

  if (leftover > 1e-12) {
    const beginningBalance = endingFromApy(deposit, apyDecimal, fullYears);
    const endingBalance = endingFromApy(deposit, apyDecimal, years);
    schedule.push({
      year: fullYears + 1,
      yearFraction: leftover,
      beginningBalance,
      interest: endingBalance - beginningBalance,
      endingBalance,
    });
  }

  return schedule;
}

export function computeCdRate(input: CdRateInput): CdRateResult {
  if (input.mode !== "apy" && input.mode !== "nominal") {
    return emptyResult("Choose APY or interest rate.");
  }

  if (input.termUnit !== "years" && input.termUnit !== "months") {
    return emptyResult("Choose a term in months or years.");
  }

  if (!isCdCompounding(input.compounding)) {
    return emptyResult("Choose a compounding frequency.");
  }

  if (!isFiniteNumber(input.deposit) || input.deposit <= 0 || input.deposit > MAX_DEPOSIT) {
    return emptyResult("Enter a deposit greater than 0.");
  }

  if (
    !isFiniteNumber(input.ratePercent) ||
    input.ratePercent < 0 ||
    input.ratePercent > MAX_RATE_PERCENT
  ) {
    return emptyResult("Enter a finite APY or interest rate from 0% to 100%.");
  }

  if (!isFiniteNumber(input.term) || input.term <= 0) {
    return emptyResult(
      input.termUnit === "months"
        ? "Enter a term greater than 0 months."
        : "Enter a term greater than 0 years.",
    );
  }

  const maxTerm = input.termUnit === "months" ? MAX_MONTHS : MAX_YEARS;
  if (input.term > maxTerm) {
    return emptyResult(
      input.termUnit === "months"
        ? `Term must be ${MAX_MONTHS} months or less.`
        : `Term must be ${MAX_YEARS} years or less.`,
    );
  }

  const years = yearsFromTerm(input.term, input.termUnit);
  const rateDecimal = input.ratePercent / 100;

  let apyDecimal: number;
  let nominalDecimal: number;

  if (input.mode === "apy") {
    apyDecimal = rateDecimal;
    nominalDecimal = nominalFromApy(apyDecimal, input.compounding);
  } else {
    nominalDecimal = rateDecimal;
    apyDecimal = apyFromNominal(nominalDecimal, input.compounding);
  }

  if (!Number.isFinite(apyDecimal) || apyDecimal < 0 || !Number.isFinite(nominalDecimal)) {
    return emptyResult("That rate and compounding combination is not a usable CD rate.");
  }

  const endingBalance = endingFromApy(input.deposit, apyDecimal, years);
  if (!Number.isFinite(endingBalance) || endingBalance < 0) {
    return emptyResult("That deposit, rate, and term combination is too large to calculate.");
  }

  const interestEarned = endingBalance - input.deposit;
  const effectiveYieldPercent = (interestEarned / input.deposit) * 100;
  const n = periodsPerYear(input.compounding);
  const periodCount = n === null ? null : n * years;
  const apyPercent = apyDecimal * 100;
  const nominalPercent = nominalDecimal * 100;
  const schedule = buildCdSchedule(input.deposit, apyDecimal, years);
  const summary = formatCdSummary({
    deposit: input.deposit,
    endingBalance,
    interestEarned,
    apyPercent,
    years,
    term: input.term,
    termUnit: input.termUnit,
    compounding: input.compounding,
  });

  return {
    status: "ok",
    valid: true,
    error: null,
    deposit: input.deposit,
    years,
    term: input.term,
    termUnit: input.termUnit,
    compounding: input.compounding,
    periodsPerYear: n,
    periodCount,
    apyPercent,
    nominalPercent,
    endingBalance,
    interestEarned,
    effectiveYieldPercent,
    schedule,
    summary,
  };
}
