export type TermUnit = "days" | "months" | "years";

export type SimpleInterestStatus = "ok" | "invalid";

export type SimpleInterestInput = {
  principal: number;
  ratePercent: number;
  term: number;
  termUnit: TermUnit;
  /** Day-count basis for terms in days (365 or 360). Defaults to 365. */
  dayBasis?: 365 | 360;
};

export type SimpleInterestResult = {
  status: SimpleInterestStatus;
  valid: boolean;
  error: string | null;
  principal: number | null;
  ratePercent: number | null;
  years: number | null;
  interest: number | null;
  totalAmount: number | null;
};

const emptyResult = (error: string): SimpleInterestResult => ({
  status: "invalid",
  valid: false,
  error,
  principal: null,
  ratePercent: null,
  years: null,
  interest: null,
  totalAmount: null,
});

function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Convert a term in days, months, or years to years. */
export function termInYears(term: number, unit: TermUnit, dayBasis: 365 | 360 = 365): number {
  if (unit === "days") return term / dayBasis;
  if (unit === "months") return term / 12;
  return term;
}

/** Simple interest I = P × r × t, with r as a decimal annual rate and t in years. */
export function simpleInterest(principal: number, ratePercent: number, years: number): number {
  return principal * (ratePercent / 100) * years;
}

export function computeSimpleInterest(input: SimpleInterestInput): SimpleInterestResult {
  const unit = input.termUnit;
  if (unit !== "days" && unit !== "months" && unit !== "years") {
    return emptyResult("Choose days, months, or years for the term.");
  }
  if (!isNonNegativeFinite(input.principal)) {
    return emptyResult("Enter a finite principal of 0 or more.");
  }
  if (!isNonNegativeFinite(input.ratePercent)) {
    return emptyResult("Enter a finite annual interest rate of 0% or more.");
  }
  if (!isNonNegativeFinite(input.term)) {
    return emptyResult("Enter a finite term of 0 or more.");
  }
  const dayBasis = input.dayBasis === 360 ? 360 : 365;
  const years = termInYears(input.term, unit, dayBasis);
  const interest = simpleInterest(input.principal, input.ratePercent, years);
  return {
    status: "ok",
    valid: true,
    error: null,
    principal: input.principal,
    ratePercent: input.ratePercent,
    years,
    interest,
    totalAmount: input.principal + interest,
  };
}
