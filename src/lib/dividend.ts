export type HoldingMode = "shares" | "amount";
export type DividendMode = "perShare" | "yield";

export interface DividendInput {
  holdingMode: HoldingMode;
  /** Number of shares (holdingMode "shares") or dollars invested (holdingMode "amount"). */
  holding: number;
  /** Current share price in dollars. */
  price: number;
  dividendMode: DividendMode;
  /** Annual dividend per share in dollars (dividendMode "perShare") or annual yield percent (dividendMode "yield"). */
  dividend: number;
  /** Payouts per year: 1, 2, 4, or 12. */
  frequency: number;
  /** Projection length in years (0 to skip). */
  years: number;
  /** Annual dividend growth percent. */
  dividendGrowth: number;
  /** Annual share price growth percent. */
  priceGrowth: number;
}

export interface DividendYearRow {
  year: number;
  shares: number;
  dividendsThisYear: number;
  totalDividends: number;
  portfolioValue: number;
  annualIncomeRunRate: number;
}

export type DividendResult =
  | {
      valid: true;
      shares: number;
      invested: number;
      annualDividendPerShare: number;
      yieldPercent: number;
      annualIncome: number;
      perPayout: number;
      monthlyIncome: number;
      frequency: number;
      rows: DividendYearRow[];
      dripFinalShares: number;
      dripFinalValue: number;
      dripTotalDividends: number;
      noDripTotalDividends: number;
      noDripFinalValue: number;
    }
  | { valid: false; error: string };

export const MAX_YEARS = 60;
export const FREQUENCIES = [1, 2, 4, 12];

export function frequencyName(frequency: number): string {
  switch (frequency) {
    case 1:
      return "Annual";
    case 2:
      return "Semiannual";
    case 4:
      return "Quarterly";
    case 12:
      return "Monthly";
    default:
      return `${frequency}x per year`;
  }
}

export function computeDividend(input: DividendInput): DividendResult {
  const { holdingMode, holding, price, dividendMode, dividend, frequency, years, dividendGrowth, priceGrowth } = input;
  if (![holding, price, dividend, frequency, years, dividendGrowth, priceGrowth].every(Number.isFinite)) {
    return { valid: false, error: "Enter a number in every field." };
  }
  if (price <= 0) return { valid: false, error: "Share price must be greater than 0." };
  if (holding <= 0) {
    return { valid: false, error: holdingMode === "shares" ? "Shares must be greater than 0." : "Amount invested must be greater than 0." };
  }
  if (dividend < 0) return { valid: false, error: "Dividend can't be negative." };
  if (!FREQUENCIES.includes(frequency)) return { valid: false, error: "Choose a payout frequency." };
  if (!Number.isInteger(years) || years < 0 || years > MAX_YEARS) {
    return { valid: false, error: `Years must be a whole number from 0 to ${MAX_YEARS}.` };
  }
  if (dividendGrowth <= -100 || priceGrowth <= -100) {
    return { valid: false, error: "Growth rates must be greater than -100%." };
  }

  const shares = holdingMode === "shares" ? holding : holding / price;
  const invested = shares * price;
  const annualDividendPerShare = dividendMode === "perShare" ? dividend : (price * dividend) / 100;
  const yieldPercent = (annualDividendPerShare / price) * 100;
  const annualIncome = shares * annualDividendPerShare;
  const perPayout = annualIncome / frequency;

  const rows: DividendYearRow[] = [];
  let dripShares = shares;
  let totalDividends = 0;
  let noDripTotal = 0;
  let dps = annualDividendPerShare;
  let sharePrice = price;
  for (let year = 1; year <= years; year += 1) {
    let dividendsThisYear = 0;
    for (let p = 0; p < frequency; p += 1) {
      const payout = dripShares * (dps / frequency);
      dividendsThisYear += payout;
      // Reinvest at the price that applies this year, rising smoothly within the year.
      const priceNow = sharePrice * Math.pow(1 + priceGrowth / 100, (p + 1) / frequency);
      dripShares += payout / priceNow;
    }
    noDripTotal += shares * dps;
    totalDividends += dividendsThisYear;
    sharePrice *= 1 + priceGrowth / 100;
    dps *= 1 + dividendGrowth / 100;
    rows.push({
      year,
      shares: dripShares,
      dividendsThisYear,
      totalDividends,
      portfolioValue: dripShares * sharePrice,
      annualIncomeRunRate: dripShares * dps,
    });
  }

  const last = rows[rows.length - 1];
  return {
    valid: true,
    shares,
    invested,
    annualDividendPerShare,
    yieldPercent,
    annualIncome,
    perPayout,
    monthlyIncome: annualIncome / 12,
    frequency,
    rows,
    dripFinalShares: last ? last.shares : shares,
    dripFinalValue: last ? last.portfolioValue : invested,
    dripTotalDividends: last ? last.totalDividends : 0,
    noDripTotalDividends: noDripTotal,
    noDripFinalValue: years > 0 ? shares * price * Math.pow(1 + priceGrowth / 100, years) : invested,
  };
}

export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function formatShares(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
