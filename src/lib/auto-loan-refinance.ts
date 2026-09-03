export const MAX_TERM_MONTHS = 20 * 12;

export type AutoLoanRefinanceInput = {
  currentBalance: number;
  currentRatePercent: number;
  remainingYears: number;
  remainingExtraMonths: number;
  newRatePercent: number;
  newTermMonths: number;
  fees: number;
  extraMonthlyPayment: number;
};

export type AutoLoanRefinanceResult = {
  valid: boolean;
  remainingMonths: number | null;
  newTermMonths: number | null;
  currentMonthlyPayment: number | null;
  newMonthlyPayment: number | null;
  newPaymentWithExtra: number | null;
  monthlySavings: number | null;
  monthlyCashFlowChange: number | null;
  currentTotalInterest: number | null;
  newTotalInterest: number | null;
  interestSavings: number | null;
  currentTotalCost: number | null;
  newLoanPayments: number | null;
  newTotalCost: number | null;
  totalCostSavings: number | null;
  breakEvenMonths: number | null;
  neverBreaksEven: boolean;
  newMonthsToPayoff: number | null;
  extraMonthlyPayment: number;
  fees: number;
};

const emptyResult: AutoLoanRefinanceResult = {
  valid: false,
  remainingMonths: null,
  newTermMonths: null,
  currentMonthlyPayment: null,
  newMonthlyPayment: null,
  newPaymentWithExtra: null,
  monthlySavings: null,
  monthlyCashFlowChange: null,
  currentTotalInterest: null,
  newTotalInterest: null,
  interestSavings: null,
  currentTotalCost: null,
  newLoanPayments: null,
  newTotalCost: null,
  totalCostSavings: null,
  breakEvenMonths: null,
  neverBreaksEven: false,
  newMonthsToPayoff: null,
  extraMonthlyPayment: 0,
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

export type PayoffSchedule = {
  months: number;
  totalPaid: number;
  totalInterest: number;
};

export function payoffWithPayment(
  principal: number,
  annualRatePercent: number,
  monthlyPayment: number,
): PayoffSchedule | null {
  if (!isFiniteNumber(principal) || principal < 0) return null;
  if (!isFiniteNumber(annualRatePercent) || annualRatePercent < 0) return null;
  if (!isFiniteNumber(monthlyPayment) || monthlyPayment < 0) return null;
  if (principal === 0) return { months: 0, totalPaid: 0, totalInterest: 0 };
  if (monthlyPayment === 0) return null;

  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    const months = Math.ceil(principal / monthlyPayment);
    if (months < 1 || months > MAX_TERM_MONTHS * 2) return null;
    return {
      months,
      totalPaid: principal,
      totalInterest: 0,
    };
  }

  if (monthlyPayment <= principal * monthlyRate + 1e-9) {
    return null;
  }

  let balance = principal;
  let totalPaid = 0;
  let months = 0;
  const maxMonths = MAX_TERM_MONTHS * 2;

  while (balance > 0.005 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const due = balance + interest;
    const pay = Math.min(monthlyPayment, due);
    balance = due - pay;
    totalPaid += pay;
    months += 1;
  }

  if (balance > 0.005) return null;

  return {
    months,
    totalPaid,
    totalInterest: Math.max(0, totalPaid - principal),
  };
}

export function computeAutoLoanRefinance(
  input: AutoLoanRefinanceInput,
): AutoLoanRefinanceResult {
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
  const extra =
    isFiniteNumber(input.extraMonthlyPayment) && input.extraMonthlyPayment >= 0
      ? input.extraMonthlyPayment
      : NaN;

  if (
    !balanceOk ||
    !currentRateOk ||
    !newRateOk ||
    remainingMonths === null ||
    newTermMonths === null ||
    !isFiniteNumber(fees) ||
    !isFiniteNumber(extra)
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

  const newPaymentWithExtra = newMonthlyPayment + extra;
  const currentTotalInterest = remainingInterest(
    input.currentBalance,
    currentMonthlyPayment,
    remainingMonths,
  );
  const currentTotalCost = currentMonthlyPayment * remainingMonths;

  let newTotalInterest: number;
  let newLoanPayments: number;
  let newMonthsToPayoff: number;

  if (extra === 0) {
    newTotalInterest = remainingInterest(
      input.currentBalance,
      newMonthlyPayment,
      newTermMonths,
    );
    newLoanPayments = newMonthlyPayment * newTermMonths;
    newMonthsToPayoff = newTermMonths;
  } else {
    const payoff = payoffWithPayment(
      input.currentBalance,
      input.newRatePercent,
      newPaymentWithExtra,
    );
    if (payoff === null) {
      return emptyResult;
    }
    newTotalInterest = payoff.totalInterest;
    newLoanPayments = payoff.totalPaid;
    newMonthsToPayoff = payoff.months;
  }

  const newTotalCost = newLoanPayments + fees;
  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
  const monthlyCashFlowChange = currentMonthlyPayment - newPaymentWithExtra;

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
    newPaymentWithExtra,
    monthlySavings,
    monthlyCashFlowChange,
    currentTotalInterest,
    newTotalInterest,
    interestSavings: currentTotalInterest - newTotalInterest,
    currentTotalCost,
    newLoanPayments,
    newTotalCost,
    totalCostSavings: currentTotalCost - newTotalCost,
    breakEvenMonths,
    neverBreaksEven,
    newMonthsToPayoff,
    extraMonthlyPayment: extra,
    fees,
  };
}
