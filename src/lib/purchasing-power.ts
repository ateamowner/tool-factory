export const DEFAULT_INFLATION_PERCENT = 3;
export const MIN_YEAR = 1800;
export const MAX_YEAR = 2200;
export const MIN_INFLATION_PERCENT = -50;
export const MAX_INFLATION_PERCENT = 100;
export const MAX_YEARS_SPAN = 200;

export type PurchasingPowerMode = "rate" | "cpi";

export type PurchasingPowerInput = {
  amount: number;
  mode: PurchasingPowerMode;
  startYear: number;
  endYear: number;
  years: number;
  useYearsSpan: boolean;
  inflationPercent: number;
  startCpi: number;
  endCpi: number;
};

export type PurchasingPowerResult = {
  valid: boolean;
  amount: number | null;
  startYear: number | null;
  endYear: number | null;
  years: number | null;
  inflationPercent: number | null;
  startCpi: number | null;
  endCpi: number | null;
  priceMultiplier: number | null;
  equivalentAmount: number | null;
  sameNominalBuys: number | null;
  percentChangePurchasingPower: number | null;
  percentChangePrices: number | null;
  lookingForward: boolean;
  lookingBackward: boolean;
  samePeriod: boolean;
  summary: string | null;
};

const emptyResult: PurchasingPowerResult = {
  valid: false,
  amount: null,
  startYear: null,
  endYear: null,
  years: null,
  inflationPercent: null,
  startCpi: null,
  endCpi: null,
  priceMultiplier: null,
  equivalentAmount: null,
  sameNominalBuys: null,
  percentChangePurchasingPower: null,
  percentChangePrices: null,
  lookingForward: false,
  lookingBackward: false,
  samePeriod: false,
  summary: null,
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function clampYear(year: number): number | null {
  if (!isFiniteNumber(year)) return null;
  const rounded = Math.round(year);
  if (rounded < MIN_YEAR || rounded > MAX_YEAR) return null;
  return rounded;
}

export function clampInflationPercent(value: number): number | null {
  if (!isFiniteNumber(value)) return null;
  if (value <= -100) return null;
  if (value < MIN_INFLATION_PERCENT || value > MAX_INFLATION_PERCENT) return null;
  return value;
}

export function clampYearsSpan(years: number): number | null {
  if (!isFiniteNumber(years)) return null;
  if (Math.abs(years) > MAX_YEARS_SPAN) return null;
  return years;
}

export function compoundPriceMultiplier(inflationPercent: number, years: number): number {
  return (1 + inflationPercent / 100) ** years;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPlainNumber(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
}

function formatYearLabel(year: number): string {
  if (Number.isInteger(year)) return String(year);
  return formatPlainNumber(year);
}

export function formatPurchasingPowerSummary(input: {
  amount: number;
  equivalentAmount: number;
  startYear: number;
  endYear: number;
  years: number;
  mode: PurchasingPowerMode;
  inflationPercent: number | null;
  startCpi: number | null;
  endCpi: number | null;
}): string {
  const amount = formatUsd(input.amount);
  const equivalent = formatUsd(input.equivalentAmount);
  const start = formatYearLabel(input.startYear);
  const end = formatYearLabel(input.endYear);

  if (input.years === 0) {
    return `${amount} in ${start} buys about ${equivalent} of goods in ${end} (same year, no inflation applied).`;
  }

  if (input.mode === "cpi" && input.startCpi !== null && input.endCpi !== null) {
    return `${amount} in ${start} buys about ${equivalent} of goods in ${end} based on the CPI change from ${formatPlainNumber(input.startCpi)} to ${formatPlainNumber(input.endCpi)}.`;
  }

  const rate = input.inflationPercent ?? DEFAULT_INFLATION_PERCENT;
  return `${amount} in ${start} buys about ${equivalent} of goods in ${end} at ${formatPlainNumber(rate)}% average annual inflation.`;
}

export function computePurchasingPower(input: PurchasingPowerInput): PurchasingPowerResult {
  const amountOk = isFiniteNumber(input.amount) && input.amount > 0;
  const startYear = clampYear(input.startYear);

  let years: number | null = null;
  let endYear: number | null = null;

  if (input.useYearsSpan) {
    years = clampYearsSpan(input.years);
    if (startYear !== null && years !== null) {
      endYear = startYear + years;
    }
  } else {
    endYear = clampYear(input.endYear);
    if (startYear !== null && endYear !== null) {
      years = endYear - startYear;
    }
  }

  if (!amountOk || startYear === null || endYear === null || years === null) {
    return emptyResult;
  }

  let priceMultiplier: number;
  let inflationPercent: number | null = null;
  let startCpi: number | null = null;
  let endCpi: number | null = null;

  if (input.mode === "cpi") {
    const startOk = isFiniteNumber(input.startCpi) && input.startCpi > 0;
    const endOk = isFiniteNumber(input.endCpi) && input.endCpi > 0;
    if (!startOk || !endOk) {
      return emptyResult;
    }
    startCpi = input.startCpi;
    endCpi = input.endCpi;
    priceMultiplier = endCpi / startCpi;
  } else {
    inflationPercent = clampInflationPercent(input.inflationPercent);
    if (inflationPercent === null) {
      return emptyResult;
    }
    priceMultiplier = compoundPriceMultiplier(inflationPercent, years);
  }

  if (!Number.isFinite(priceMultiplier) || priceMultiplier <= 0) {
    return emptyResult;
  }

  const equivalentAmount = input.amount * priceMultiplier;
  const sameNominalBuys = input.amount / priceMultiplier;
  const percentChangePrices = (priceMultiplier - 1) * 100;
  const percentChangePurchasingPower = (1 / priceMultiplier - 1) * 100;

  return {
    valid: true,
    amount: input.amount,
    startYear,
    endYear,
    years,
    inflationPercent,
    startCpi,
    endCpi,
    priceMultiplier,
    equivalentAmount,
    sameNominalBuys,
    percentChangePurchasingPower,
    percentChangePrices,
    lookingForward: years > 0,
    lookingBackward: years < 0,
    samePeriod: years === 0,
    summary: formatPurchasingPowerSummary({
      amount: input.amount,
      equivalentAmount,
      startYear,
      endYear,
      years,
      mode: input.mode,
      inflationPercent,
      startCpi,
      endCpi,
    }),
  };
}
