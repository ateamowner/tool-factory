export type FvCompounding =
  | "daily"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";

export type FvContributionFrequency = "monthly" | "quarterly" | "semiannual" | "annual";
export type FvContributionTiming = "end" | "beginning";

export const COMPOUNDING_PERIODS = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
} as const;

export const CONTRIBUTION_PERIODS = {
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
} as const;

export const MAX_AMOUNT = 1_000_000_000_000;
export const MAX_RATE_PERCENT = 100;
export const MAX_YEARS = 80;

export const COMPOUNDING_OPTIONS: { id: FvCompounding; label: string }[] = [
  { id: "daily", label: "Daily (365)" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "semiannual", label: "Semiannual" },
  { id: "annual", label: "Annual" },
];

export const CONTRIBUTION_FREQUENCY_OPTIONS: {
  id: FvContributionFrequency;
  label: string;
}[] = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "semiannual", label: "Semiannual" },
  { id: "annual", label: "Annual" },
];

export type FutureValueInput = {
  presentValue: number;
  contribution: number;
  contributionFrequency: FvContributionFrequency;
  contributionTiming: FvContributionTiming;
  ratePercent: number;
  compounding: FvCompounding;
  years: number;
};

export type FutureValueScheduleRow = {
  year: number;
  yearFraction: number;
  beginningBalance: number;
  contributions: number;
  interest: number;
  endingBalance: number;
};

export type FutureValueStatus = "ok" | "invalid";

export type FutureValueResult = {
  status: FutureValueStatus;
  valid: boolean;
  error: string | null;
  presentValue: number | null;
  contribution: number | null;
  contributionFrequency: FvContributionFrequency | null;
  contributionTiming: FvContributionTiming | null;
  years: number | null;
  compounding: FvCompounding | null;
  periodsPerYear: number | null;
  periodCount: number | null;
  contributionPeriodsPerYear: number | null;
  contributionCount: number | null;
  ratePercent: number | null;
  futureValue: number | null;
  totalContributions: number | null;
  interestEarned: number | null;
  effectiveYieldPercent: number | null;
  schedule: FutureValueScheduleRow[];
  summary: string | null;
};

const emptyResult = (error: string): FutureValueResult => ({
  status: "invalid",
  valid: false,
  error,
  presentValue: null,
  contribution: null,
  contributionFrequency: null,
  contributionTiming: null,
  years: null,
  compounding: null,
  periodsPerYear: null,
  periodCount: null,
  contributionPeriodsPerYear: null,
  contributionCount: null,
  ratePercent: null,
  futureValue: null,
  totalContributions: null,
  interestEarned: null,
  effectiveYieldPercent: null,
  schedule: [],
  summary: null,
});

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function isFvCompounding(value: string): value is FvCompounding {
  return COMPOUNDING_OPTIONS.some((option) => option.id === value);
}

export function isFvContributionFrequency(
  value: string,
): value is FvContributionFrequency {
  return CONTRIBUTION_FREQUENCY_OPTIONS.some((option) => option.id === value);
}

export function isFvContributionTiming(value: string): value is FvContributionTiming {
  return value === "end" || value === "beginning";
}

export function compoundingLabel(compounding: FvCompounding): string {
  return COMPOUNDING_OPTIONS.find((option) => option.id === compounding)?.label ?? compounding;
}

export function contributionFrequencyLabel(frequency: FvContributionFrequency): string {
  return (
    CONTRIBUTION_FREQUENCY_OPTIONS.find((option) => option.id === frequency)?.label ?? frequency
  );
}

/** Growth factor on a lump sum: (1 + r/n)^(n*t). */
export function lumpSumFactor(
  annualDecimal: number,
  compoundingPeriods: number,
  years: number,
): number {
  return (1 + annualDecimal / compoundingPeriods) ** (compoundingPeriods * years);
}

/**
 * Effective interest rate per contribution period when compounding is n times
 * a year and contributions are m times a year: (1 + r/n)^(n/m) − 1.
 */
export function contributionPeriodRate(
  annualDecimal: number,
  compoundingPeriods: number,
  contributionPeriods: number,
): number {
  if (annualDecimal === 0) return 0;
  if (contributionPeriods === compoundingPeriods) {
    return annualDecimal / compoundingPeriods;
  }
  return (1 + annualDecimal / compoundingPeriods) ** (compoundingPeriods / contributionPeriods) - 1;
}

/** Ordinary-annuity future value of PMT over N periods at rate i per period. */
export function annuityFutureValue(
  payment: number,
  periodRate: number,
  periods: number,
  timing: FvContributionTiming,
): number {
  if (payment === 0 || periods === 0) return 0;
  if (Math.abs(periodRate) < 1e-15) {
    return payment * periods;
  }
  const ordinary = payment * (((1 + periodRate) ** periods - 1) / periodRate);
  return timing === "beginning" ? ordinary * (1 + periodRate) : ordinary;
}

export function futureValueAt(
  presentValue: number,
  contribution: number,
  annualDecimal: number,
  compoundingPeriods: number,
  contributionPeriods: number,
  years: number,
  timing: FvContributionTiming,
): number {
  const lump = presentValue * lumpSumFactor(annualDecimal, compoundingPeriods, years);
  const i = contributionPeriodRate(annualDecimal, compoundingPeriods, contributionPeriods);
  const n = contributionPeriods * years;
  return lump + annuityFutureValue(contribution, i, n, timing);
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

function formatPlainNumber(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
}

function formatYearsLabel(years: number): string {
  if (years === 1) return "1 year";
  return `${formatPlainNumber(years)} years`;
}

export function formatFutureValueSummary(input: {
  presentValue: number;
  contribution: number;
  contributionFrequency: FvContributionFrequency;
  contributionTiming: FvContributionTiming;
  ratePercent: number;
  compounding: FvCompounding;
  years: number;
  futureValue: number;
  interestEarned: number;
}): string {
  const yearsLabel = formatYearsLabel(input.years);
  const rateLabel = formatPercent(input.ratePercent);
  const compoundLabel = compoundingLabel(input.compounding).toLowerCase();
  const base = `${formatUsd(input.presentValue)} at ${rateLabel} for ${yearsLabel} (${compoundLabel} compounding)`;

  if (input.contribution === 0) {
    return `${base} grows to ${formatUsd(input.futureValue)} — ${formatUsd(input.interestEarned)} interest earned.`;
  }

  const freqLabel = contributionFrequencyLabel(input.contributionFrequency).toLowerCase();
  const when = input.contributionTiming === "beginning" ? "beginning-of-period" : "end-of-period";
  return `${base} plus ${formatUsd(input.contribution)} ${freqLabel} (${when}) grows to ${formatUsd(input.futureValue)} — ${formatUsd(input.interestEarned)} interest earned.`;
}

export function buildFutureValueSchedule(input: {
  presentValue: number;
  contribution: number;
  annualDecimal: number;
  compoundingPeriods: number;
  contributionPeriods: number;
  years: number;
  timing: FvContributionTiming;
}): FutureValueScheduleRow[] {
  const schedule: FutureValueScheduleRow[] = [];
  const fullYears = Math.floor(input.years);
  const leftover = input.years - fullYears;

  const valueAt = (years: number) =>
    futureValueAt(
      input.presentValue,
      input.contribution,
      input.annualDecimal,
      input.compoundingPeriods,
      input.contributionPeriods,
      years,
      input.timing,
    );

  const contributionsOver = (yearFraction: number) => input.contribution * input.contributionPeriods * yearFraction;

  for (let year = 1; year <= fullYears; year += 1) {
    const beginningBalance = valueAt(year - 1);
    const endingBalance = valueAt(year);
    const contributions = contributionsOver(1);
    schedule.push({
      year,
      yearFraction: 1,
      beginningBalance,
      contributions,
      interest: endingBalance - beginningBalance - contributions,
      endingBalance,
    });
  }

  if (leftover > 1e-12) {
    const beginningBalance = valueAt(fullYears);
    const endingBalance = valueAt(input.years);
    const contributions = contributionsOver(leftover);
    schedule.push({
      year: fullYears + 1,
      yearFraction: leftover,
      beginningBalance,
      contributions,
      interest: endingBalance - beginningBalance - contributions,
      endingBalance,
    });
  }

  return schedule;
}

export function computeFutureValue(input: FutureValueInput): FutureValueResult {
  if (!isFvCompounding(input.compounding)) {
    return emptyResult("Choose a compounding frequency.");
  }

  if (!isFvContributionFrequency(input.contributionFrequency)) {
    return emptyResult("Choose how often you contribute.");
  }

  if (!isFvContributionTiming(input.contributionTiming)) {
    return emptyResult("Choose whether contributions are at the start or end of each period.");
  }

  if (
    !isFiniteNumber(input.presentValue) ||
    input.presentValue < 0 ||
    input.presentValue > MAX_AMOUNT
  ) {
    return emptyResult("Enter an initial investment of 0 or more.");
  }

  if (
    !isFiniteNumber(input.contribution) ||
    input.contribution < 0 ||
    input.contribution > MAX_AMOUNT
  ) {
    return emptyResult("Enter a periodic contribution of 0 or more, or leave it blank.");
  }

  if (input.presentValue === 0 && input.contribution === 0) {
    return emptyResult("Enter an initial investment or a periodic contribution greater than 0.");
  }

  if (
    !isFiniteNumber(input.ratePercent) ||
    input.ratePercent < 0 ||
    input.ratePercent > MAX_RATE_PERCENT
  ) {
    return emptyResult("Enter a finite annual interest rate from 0% to 100%.");
  }

  if (!isFiniteNumber(input.years) || input.years <= 0) {
    return emptyResult("Enter a number of years greater than 0.");
  }

  if (input.years > MAX_YEARS) {
    return emptyResult(`Years must be ${MAX_YEARS} or less.`);
  }

  const compoundingPeriods = COMPOUNDING_PERIODS[input.compounding];
  const contributionPeriods = CONTRIBUTION_PERIODS[input.contributionFrequency];
  const annualDecimal = input.ratePercent / 100;
  const futureValue = futureValueAt(
    input.presentValue,
    input.contribution,
    annualDecimal,
    compoundingPeriods,
    contributionPeriods,
    input.years,
    input.contributionTiming,
  );

  if (!Number.isFinite(futureValue) || futureValue < 0) {
    return emptyResult("That investment, rate, and term combination is too large to calculate.");
  }

  const contributionCount = contributionPeriods * input.years;
  const totalContributions = input.presentValue + input.contribution * contributionCount;
  const interestEarned = futureValue - totalContributions;
  const invested = totalContributions;
  const effectiveYieldPercent = invested > 0 ? (interestEarned / invested) * 100 : 0;
  const schedule = buildFutureValueSchedule({
    presentValue: input.presentValue,
    contribution: input.contribution,
    annualDecimal,
    compoundingPeriods,
    contributionPeriods,
    years: input.years,
    timing: input.contributionTiming,
  });
  const summary = formatFutureValueSummary({
    presentValue: input.presentValue,
    contribution: input.contribution,
    contributionFrequency: input.contributionFrequency,
    contributionTiming: input.contributionTiming,
    ratePercent: input.ratePercent,
    compounding: input.compounding,
    years: input.years,
    futureValue,
    interestEarned,
  });

  return {
    status: "ok",
    valid: true,
    error: null,
    presentValue: input.presentValue,
    contribution: input.contribution,
    contributionFrequency: input.contributionFrequency,
    contributionTiming: input.contributionTiming,
    years: input.years,
    compounding: input.compounding,
    periodsPerYear: compoundingPeriods,
    periodCount: compoundingPeriods * input.years,
    contributionPeriodsPerYear: contributionPeriods,
    contributionCount,
    ratePercent: input.ratePercent,
    futureValue,
    totalContributions: invested,
    interestEarned,
    effectiveYieldPercent,
    schedule,
    summary,
  };
}
