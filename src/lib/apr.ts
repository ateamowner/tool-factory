export const MAX_LOAN_AMOUNT = 1_000_000_000_000;
export const MAX_RATE_PERCENT = 100;
export const MAX_TERM_MONTHS = 50 * 12;
export const MAX_FEES = MAX_LOAN_AMOUNT;

export type AprInput = {
  loanAmount: number;
  nominalRatePercent: number;
  termYears: number;
  termExtraMonths: number;
  fees: number;
};

export type AprStatus = "ok" | "invalid";

export type AprResult = {
  status: AprStatus;
  valid: boolean;
  error: string | null;
  loanAmount: number | null;
  fees: number | null;
  netProceeds: number | null;
  termMonths: number | null;
  nominalRatePercent: number | null;
  monthlyPayment: number | null;
  aprPercent: number | null;
  totalPayments: number | null;
  totalInterest: number | null;
  totalCost: number | null;
  summary: string | null;
};

const emptyResult = (error: string): AprResult => ({
  status: "invalid",
  valid: false,
  error,
  loanAmount: null,
  fees: null,
  netProceeds: null,
  termMonths: null,
  nominalRatePercent: null,
  monthlyPayment: null,
  aprPercent: null,
  totalPayments: null,
  totalInterest: null,
  totalCost: null,
  summary: null,
});

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

/** Strip thousands separators. Empty input is NaN so callers can reject it. */
export function parseAprNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number, digits = 3): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function termMonthsFromParts(
  years: number,
  extraMonths: number,
): number | null {
  if (!isFiniteNumber(years) || !isFiniteNumber(extraMonths)) return null;
  if (years < 0 || extraMonths < 0) return null;
  const months = Math.round(years * 12 + extraMonths);
  if (months < 1 || months > MAX_TERM_MONTHS) return null;
  return months;
}

/**
 * Standard amortizing monthly payment from nominal annual rate.
 */
export function amortizingMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  months: number,
): number | null {
  if (!isFiniteNumber(principal) || principal <= 0) return null;
  if (!isFiniteNumber(annualRatePercent) || annualRatePercent < 0) return null;
  if (!isFiniteNumber(months) || months < 1) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;

  const growth = (1 + monthlyRate) ** months;
  if (!Number.isFinite(growth) || growth <= 1) return null;
  return (principal * monthlyRate * growth) / (growth - 1);
}

/**
 * Present value of an annuity: payment each month for n months at monthly rate r.
 */
export function annuityPresentValue(
  payment: number,
  monthlyRate: number,
  months: number,
): number {
  if (monthlyRate === 0) return payment * months;
  return (payment * (1 - (1 + monthlyRate) ** -months)) / monthlyRate;
}

/**
 * Solve for monthly rate r such that PV of `payment` for `months` equals `presentValue`.
 * Uses Newton-Raphson with bisection fallback. Returns null if unsolvable.
 */
export function solveMonthlyRate(
  presentValue: number,
  payment: number,
  months: number,
): number | null {
  if (
    !isFiniteNumber(presentValue) ||
    !isFiniteNumber(payment) ||
    !isFiniteNumber(months)
  ) {
    return null;
  }
  if (presentValue <= 0 || payment <= 0 || months < 1) return null;

  // Zero-interest case: PV == payment * months
  const zeroPv = payment * months;
  if (Math.abs(zeroPv - presentValue) < 1e-9) return 0;

  // If payments cannot cover principal even at 0%, no positive rate works in the
  // usual sense for a borrower APR (would need negative rate). Reject.
  if (zeroPv < presentValue - 1e-6) return null;

  // Target: f(r) = annuityPV(payment, r, n) - presentValue = 0
  const f = (r: number) => annuityPresentValue(payment, r, months) - presentValue;
  const fPrime = (r: number) => {
    if (Math.abs(r) < 1e-12) {
      // derivative at 0: payment * n(n-1)/2 * (-1) roughly via limit
      // d/dr [(p/r)(1-(1+r)^-n)] at 0 ≈ -p * n(n+1)/2
      return (-payment * months * (months + 1)) / 2;
    }
    const onePlus = 1 + r;
    const pow = onePlus ** -months;
    // d/dr [p * (1 - (1+r)^-n) / r]
    const num = 1 - pow;
    const dNum = months * onePlus ** (-months - 1);
    return (payment * (dNum * r - num)) / (r * r);
  };

  // Newton from a reasonable guess
  let r = 0.01;
  for (let i = 0; i < 40; i += 1) {
    const y = f(r);
    if (Math.abs(y) < 1e-10) {
      return r >= 0 && Number.isFinite(r) ? r : null;
    }
    const yp = fPrime(r);
    if (!Number.isFinite(yp) || Math.abs(yp) < 1e-18) break;
    const next = r - y / yp;
    if (!Number.isFinite(next) || next <= -0.99) break;
    if (Math.abs(next - r) < 1e-14) {
      return next >= 0 && Number.isFinite(next) ? next : null;
    }
    r = next;
  }

  // Bisection on [0, 5] (up to 600% APR monthly-equivalent ceiling)
  let lo = 0;
  let hi = 5;
  const fLo = f(lo);
  const fHi = f(hi);
  // At r=0, PV is highest; as r grows, PV falls. We need f(r)=0.
  if (fLo * fHi > 0) {
    // Expand hi if needed
    let expanded = hi;
    let fExp = fHi;
    for (let i = 0; i < 20 && fLo * fExp > 0; i += 1) {
      expanded *= 2;
      fExp = f(expanded);
    }
    if (fLo * fExp > 0) return null;
    hi = expanded;
  }

  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-10 || (hi - lo) / 2 < 1e-14) {
      return mid >= 0 && Number.isFinite(mid) ? mid : null;
    }
    if (f(lo) * fm <= 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  const mid = (lo + hi) / 2;
  return mid >= 0 && Number.isFinite(mid) ? mid : null;
}

export function formatAprSummary(input: {
  loanAmount: number;
  fees: number;
  netProceeds: number;
  monthlyPayment: number;
  termMonths: number;
  nominalRatePercent: number;
  aprPercent: number;
}): string {
  const feePart =
    input.fees > 0
      ? ` After ${formatUsd(input.fees)} in upfront fees, net proceeds are ${formatUsd(input.netProceeds)}.`
      : " With no upfront fees, APR matches the nominal rate.";
  return `On a ${formatUsd(input.loanAmount)} loan at ${formatPercent(input.nominalRatePercent, 2)} nominal for ${input.termMonths} months, the payment is ${formatUsd(input.monthlyPayment)}/mo.${feePart} Estimated APR is ${formatPercent(input.aprPercent)}.`;
}

/**
 * Educational APR estimate for a fixed installment loan.
 *
 * Model: monthly payment is amortized from the loan amount (principal) at the
 * nominal annual rate. Optional upfront fees reduce net proceeds (amount you
 * effectively receive). APR is the annualized internal rate that equates those
 * net proceeds to the payment stream — a standard Truth-in-Lending-style estimate.
 */
export function computeApr(input: AprInput): AprResult {
  if (
    !isFiniteNumber(input.loanAmount) ||
    input.loanAmount <= 0 ||
    input.loanAmount > MAX_LOAN_AMOUNT
  ) {
    return emptyResult(
      `Enter a loan amount greater than 0 and up to ${MAX_LOAN_AMOUNT.toLocaleString("en-US")}.`,
    );
  }

  if (
    !isFiniteNumber(input.nominalRatePercent) ||
    input.nominalRatePercent < 0 ||
    input.nominalRatePercent > MAX_RATE_PERCENT
  ) {
    return emptyResult(
      `Enter a nominal annual rate from 0 to ${MAX_RATE_PERCENT}%.`,
    );
  }

  const termMonths = termMonthsFromParts(
    input.termYears,
    input.termExtraMonths,
  );
  if (termMonths === null) {
    return emptyResult(
      `Enter a term of at least 1 month and up to ${MAX_TERM_MONTHS} months (years + months).`,
    );
  }

  const fees = isFiniteNumber(input.fees) && input.fees >= 0 ? input.fees : Number.NaN;
  if (!isFiniteNumber(fees) || fees < 0 || fees > MAX_FEES) {
    return emptyResult("Enter upfront fees of 0 or more.");
  }
  if (fees >= input.loanAmount) {
    return emptyResult("Upfront fees must be less than the loan amount.");
  }

  const monthlyPayment = amortizingMonthlyPayment(
    input.loanAmount,
    input.nominalRatePercent,
    termMonths,
  );
  if (monthlyPayment === null || !Number.isFinite(monthlyPayment)) {
    return emptyResult("Could not compute a monthly payment for these inputs.");
  }

  const netProceeds = input.loanAmount - fees;
  const monthlyRate = solveMonthlyRate(netProceeds, monthlyPayment, termMonths);
  if (monthlyRate === null) {
    return emptyResult("Could not solve APR for these inputs.");
  }

  const aprPercent = monthlyRate * 12 * 100;
  if (!Number.isFinite(aprPercent) || aprPercent < 0 || aprPercent > 1000) {
    return emptyResult("APR result is out of a reasonable range for these inputs.");
  }

  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = Math.max(0, totalPayments - input.loanAmount);
  const totalCost = totalPayments + fees;
  const summary = formatAprSummary({
    loanAmount: input.loanAmount,
    fees,
    netProceeds,
    monthlyPayment,
    termMonths,
    nominalRatePercent: input.nominalRatePercent,
    aprPercent,
  });

  return {
    status: "ok",
    valid: true,
    error: null,
    loanAmount: input.loanAmount,
    fees,
    netProceeds,
    termMonths,
    nominalRatePercent: input.nominalRatePercent,
    monthlyPayment,
    aprPercent,
    totalPayments,
    totalInterest,
    totalCost,
    summary,
  };
}
