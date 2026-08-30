export const MAX_REMAINING_MONTHS = 50 * 12;

export type MortgageRecastInput = {
  remainingBalance: number;
  annualRatePercent: number;
  remainingYears: number;
  remainingExtraMonths: number;
  lumpSum: number;
};

export type MortgageRecastResult = {
  valid: boolean;
  remainingMonths: number | null;
  currentMonthlyPayment: number | null;
  newMonthlyPayment: number | null;
  paymentDrop: number | null;
  newBalance: number | null;
  interestWithoutRecast: number | null;
  interestWithRecast: number | null;
  interestSavings: number | null;
  totalPaidWithoutRecast: number | null;
  scheduledPaidWithRecast: number | null;
  paidOff: boolean;
};

const emptyResult: MortgageRecastResult = {
  valid: false,
  remainingMonths: null,
  currentMonthlyPayment: null,
  newMonthlyPayment: null,
  paymentDrop: null,
  newBalance: null,
  interestWithoutRecast: null,
  interestWithRecast: null,
  interestSavings: null,
  totalPaidWithoutRecast: null,
  scheduledPaidWithRecast: null,
  paidOff: false,
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function remainingTermMonths(
  years: number,
  extraMonths: number,
): number | null {
  if (!isFiniteNumber(years) || !isFiniteNumber(extraMonths)) return null;
  if (years < 0 || extraMonths < 0) return null;
  const months = Math.round(years * 12 + extraMonths);
  if (months < 1 || months > MAX_REMAINING_MONTHS) return null;
  return months;
}

export function amortizingMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  months: number,
): number | null {
  if (!isFiniteNumber(principal) || principal < 0) return null;
  if (!isFiniteNumber(annualRatePercent) || annualRatePercent < 0) return null;
  if (!isFiniteNumber(months) || months < 1) return null;
  if (principal === 0) return 0;

  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;

  const growth = (1 + monthlyRate) ** months;
  if (!Number.isFinite(growth) || growth <= 1) return null;
  return (principal * monthlyRate * growth) / (growth - 1);
}

function remainingInterest(principal: number, monthlyPayment: number, months: number): number {
  return Math.max(0, monthlyPayment * months - principal);
}

export function computeMortgageRecast(input: MortgageRecastInput): MortgageRecastResult {
  const remainingMonths = remainingTermMonths(
    input.remainingYears,
    input.remainingExtraMonths,
  );
  const balanceOk =
    isFiniteNumber(input.remainingBalance) && input.remainingBalance > 0;
  const rateOk = isFiniteNumber(input.annualRatePercent) && input.annualRatePercent >= 0;
  const lumpOk = isFiniteNumber(input.lumpSum) && input.lumpSum >= 0;

  if (!balanceOk || !rateOk || remainingMonths === null || !lumpOk) {
    return emptyResult;
  }

  if (input.lumpSum > input.remainingBalance) {
    return emptyResult;
  }

  const currentMonthlyPayment = amortizingMonthlyPayment(
    input.remainingBalance,
    input.annualRatePercent,
    remainingMonths,
  );
  if (currentMonthlyPayment === null) {
    return emptyResult;
  }

  const newBalance = input.remainingBalance - input.lumpSum;
  const paidOff = newBalance === 0;
  const newMonthlyPayment = amortizingMonthlyPayment(
    newBalance,
    input.annualRatePercent,
    remainingMonths,
  );
  if (newMonthlyPayment === null) {
    return emptyResult;
  }

  const interestWithoutRecast = remainingInterest(
    input.remainingBalance,
    currentMonthlyPayment,
    remainingMonths,
  );
  const interestWithRecast = remainingInterest(
    newBalance,
    newMonthlyPayment,
    remainingMonths,
  );

  return {
    valid: true,
    remainingMonths,
    currentMonthlyPayment,
    newMonthlyPayment,
    paymentDrop: currentMonthlyPayment - newMonthlyPayment,
    newBalance,
    interestWithoutRecast,
    interestWithRecast,
    interestSavings: interestWithoutRecast - interestWithRecast,
    totalPaidWithoutRecast: currentMonthlyPayment * remainingMonths,
    scheduledPaidWithRecast: newMonthlyPayment * remainingMonths,
    paidOff,
  };
}
