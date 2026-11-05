export type RuleOf72Mode = "years-from-rate" | "rate-from-years";

export type RuleOf72Input = {
  mode: RuleOf72Mode;
  /** Annual rate as a percent, e.g. 8 for 8%. Used in years-from-rate mode. */
  ratePercent: number;
  /** Years to double. Used in rate-from-years mode. */
  years: number;
};

export type RuleEstimates = {
  rule72: number;
  rule70: number;
  rule693: number;
  exact: number;
};

export type RuleOf72Result =
  | {
      valid: true;
      mode: RuleOf72Mode;
      ratePercent: number | null;
      years: number | null;
      /** Years to double (years-from-rate) or rate % needed (rate-from-years). */
      estimates: RuleEstimates;
      unit: "years" | "percent";
    }
  | { valid: false; error: string };

const LN2 = Math.LN2;

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/** Rule-of-N estimate: constant / ratePercent → years, or constant / years → rate %. */
export function ruleEstimate(constant: number, divisor: number): number {
  return constant / divisor;
}

/** Exact years to double at annual rate r (as a decimal): ln(2) / ln(1 + r). */
export function exactYearsToDouble(rateDecimal: number): number {
  return LN2 / Math.log(1 + rateDecimal);
}

/** Exact annual rate (decimal) to double in t years: 2^(1/t) − 1. */
export function exactRateToDouble(years: number): number {
  return Math.pow(2, 1 / years) - 1;
}

/** Format a number with up to `digits` decimals, trimming trailing zeros. */
export function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "";
  if (n !== 0 && (Math.abs(n) >= 1e12 || Math.abs(n) < 1e-6)) return n.toExponential(digits);
  const fixed = n.toFixed(digits);
  const trimmed = fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
  const [intPart, dec] = trimmed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withCommas}.${dec}` : withCommas;
}

export function formatYears(n: number): string {
  return `${fmt(n)} yr`;
}

export function formatPercent(n: number): string {
  return `${fmt(n)}%`;
}

export function computeRuleOf72(input: RuleOf72Input): RuleOf72Result {
  if (input.mode !== "years-from-rate" && input.mode !== "rate-from-years") {
    return { valid: false, error: "Choose years from rate, or rate from years." };
  }

  if (input.mode === "years-from-rate") {
    if (!isPositiveFinite(input.ratePercent)) {
      return { valid: false, error: "Enter a positive annual rate greater than 0%." };
    }
    // Exact formula needs 1 + r > 0 and r ≠ 0; r as percent > 0 already covers this for normal rates.
    // Cap absurd rates that would make 1+r ≤ 0 (rate ≤ −100%) — already rejected by > 0.
    const rateDecimal = input.ratePercent / 100;
    if (!(1 + rateDecimal > 0) || !Number.isFinite(Math.log(1 + rateDecimal))) {
      return { valid: false, error: "Enter a rate where compound growth is defined." };
    }
    const exact = exactYearsToDouble(rateDecimal);
    if (!Number.isFinite(exact) || exact <= 0) {
      return { valid: false, error: "Could not compute years to double for that rate." };
    }
    return {
      valid: true,
      mode: "years-from-rate",
      ratePercent: input.ratePercent,
      years: null,
      unit: "years",
      estimates: {
        rule72: ruleEstimate(72, input.ratePercent),
        rule70: ruleEstimate(70, input.ratePercent),
        rule693: ruleEstimate(69.3, input.ratePercent),
        exact,
      },
    };
  }

  if (!isPositiveFinite(input.years)) {
    return { valid: false, error: "Enter a positive number of years greater than 0." };
  }
  const exactDecimal = exactRateToDouble(input.years);
  if (!Number.isFinite(exactDecimal) || exactDecimal <= -1) {
    return { valid: false, error: "Could not compute the rate to double in that time." };
  }
  const exactPercent = exactDecimal * 100;
  return {
    valid: true,
    mode: "rate-from-years",
    ratePercent: null,
    years: input.years,
    unit: "percent",
    estimates: {
      rule72: ruleEstimate(72, input.years),
      rule70: ruleEstimate(70, input.years),
      rule693: ruleEstimate(69.3, input.years),
      exact: exactPercent,
    },
  };
}
