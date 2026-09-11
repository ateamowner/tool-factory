export const MAX_TERM_MONTHS = 30 * 12;

export type StudentLoanRefinanceInput = {
  currentBalance: number;
  currentRatePercent: number;
  remainingYears: number;
  remainingExtraMonths: number;
  newRatePercent: number;
  newTermMonths: number;
  fees: number;
};

export type StudentLoanRefinanceResult = {
  valid: boolean;
  remainingMonths: number | null;
  newTermMonths: number | null;
  currentMonthlyPayment: number | null;
  newMonthlyPayment: number | null;
  monthlySavings: number | null;
  currentTotalInterest: number | null;
  newTotalInterest: number | null;
  interestSavings: number | null;
  currentTotalCost: number | null;
  newLoanPayments: number | null;
  newTotalCost: number | null;
  totalCostSavings: number | null;
  breakEvenMonths: number | null;
  neverBreaksEven: boolean;
  fees: number;
};

const emptyResult: StudentLoanRefinanceResult = {
  valid: false,
  remainingMonths: null,
  newTermMonths: null,
  currentMonthlyPayment: null,
  newMonthlyPayment: null,
  monthlySavings: null,
  currentTotalInterest: null,
  newTotalInterest: null,
  interestSavings: null,
  currentTotalCost: null,
  newLoanPayments: null,
  newTotalCost: null,
  totalCostSavings: null,
  breakEvenMonths: null,
  neverBreaksEven: false,
  fees: 0,
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
  if (months < 1 || months > MAX_TERM_MONTHS) return null;
  return months;
}

export function clampTermMonths(months: number): number | null {
  if (!isFiniteNumber(months)) return null;
  const rounded = Math.round(months);
  if (rounded < 1 || rounded > MAX_TERM_MONTHS) return null;
  return rounded;
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

export function computeStudentLoanRefinance(
  input: StudentLoanRefinanceInput,
): StudentLoanRefinanceResult {
  const remainingMonths = remainingTermMonths(
    input.remainingYears,
    input.remainingExtraMonths,
  );
  const newTermMonths = clampTermMonths(input.newTermMonths);
  const balanceOk = isFiniteNumber(input.currentBalance) && input.currentBalance > 0;
  const currentRateOk =
    isFiniteNumber(input.currentRatePercent) && input.currentRatePercent >= 0;
  const newRateOk = isFiniteNumber(input.newRatePercent) && input.newRatePercent >= 0;
  const fees = isFiniteNumber(input.fees) && input.fees >= 0 ? input.fees : NaN;

  if (
    !balanceOk ||
    !currentRateOk ||
    !newRateOk ||
    remainingMonths === null ||
    newTermMonths === null ||
    !isFiniteNumber(fees)
  ) {
    return emptyResult;
  }

  const currentMonthlyPayment = amortizingMonthlyPayment(
    input.currentBalance,
    input.currentRatePercent,
    remainingMonths,
  );
  const newMonthlyPayment = amortizingMonthlyPayment(
    input.currentBalance,
    input.newRatePercent,
    newTermMonths,
  );
  if (currentMonthlyPayment === null || newMonthlyPayment === null) {
    return emptyResult;
  }

  const currentTotalInterest = remainingInterest(
    input.currentBalance,
    currentMonthlyPayment,
    remainingMonths,
  );
  const newTotalInterest = remainingInterest(
    input.currentBalance,
    newMonthlyPayment,
    newTermMonths,
  );
  const currentTotalCost = currentMonthlyPayment * remainingMonths;
  const newLoanPayments = newMonthlyPayment * newTermMonths;
  const newTotalCost = newLoanPayments + fees;
  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;

  let breakEvenMonths: number | null = null;
  let neverBreaksEven = false;
  if (fees > 0) {
    if (monthlySavings > 0) {
      breakEvenMonths = fees / monthlySavings;
    } else {
      neverBreaksEven = true;
    }
  }

  return {
    valid: true,
    remainingMonths,
    newTermMonths,
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlySavings,
    currentTotalInterest,
    newTotalInterest,
    interestSavings: currentTotalInterest - newTotalInterest,
    currentTotalCost,
    newLoanPayments,
    newTotalCost,
    totalCostSavings: currentTotalCost - newTotalCost,
    breakEvenMonths,
    neverBreaksEven,
    fees,
  };
}
