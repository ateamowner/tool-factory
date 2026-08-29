export const MIN_TARGET_MONTHS = 3;
export const MAX_TARGET_MONTHS = 12;
export const DEFAULT_TARGET_MONTHS = 6;

export const TARGET_MONTH_PRESETS = [3, 6, 9, 12] as const;

export const EXPENSE_LINE_ITEMS = [
  { id: "housing", label: "Housing" },
  { id: "food", label: "Food" },
  { id: "utilities", label: "Utilities" },
  { id: "insurance", label: "Insurance" },
  { id: "transport", label: "Transport" },
  { id: "debt", label: "Debt minimums" },
] as const;

export type ExpenseLineId = (typeof EXPENSE_LINE_ITEMS)[number]["id"];

export type EmergencyFundInput = {
  monthlyExpenses: number;
  targetMonths: number;
  currentSavings: number;
  monthlyContribution: number;
};

export type EmergencyFundResult = {
  valid: boolean;
  monthlyExpenses: number | null;
  targetMonths: number | null;
  targetFund: number | null;
  currentSavings: number | null;
  gap: number | null;
  surplus: number | null;
  funded: boolean;
  monthsToFund: number | null;
  monthsToFundExact: number | null;
  threeMonthTarget: number | null;
  sixMonthTarget: number | null;
  threeMonthGap: number | null;
  sixMonthGap: number | null;
};

const emptyResult: EmergencyFundResult = {
  valid: false,
  monthlyExpenses: null,
  targetMonths: null,
  targetFund: null,
  currentSavings: null,
  gap: null,
  surplus: null,
  funded: false,
  monthsToFund: null,
  monthsToFundExact: null,
  threeMonthTarget: null,
  sixMonthTarget: null,
  threeMonthGap: null,
  sixMonthGap: null,
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function clampTargetMonths(value: number): number | null {
  if (!isFiniteNumber(value)) return null;
  if (value < MIN_TARGET_MONTHS || value > MAX_TARGET_MONTHS) return null;
  return value;
}

export function sumExpenseLines(lines: Record<string, number>): number {
  return Object.values(lines).reduce((sum, value) => {
    if (!isFiniteNumber(value) || value < 0) return sum;
    return sum + value;
  }, 0);
}

function remainingGap(target: number, currentSavings: number): number {
  return Math.max(0, target - currentSavings);
}

export function computeEmergencyFund(input: EmergencyFundInput): EmergencyFundResult {
  const targetMonths = clampTargetMonths(input.targetMonths);
  const expensesOk = isFiniteNumber(input.monthlyExpenses) && input.monthlyExpenses > 0;
  const savingsOk = isFiniteNumber(input.currentSavings) && input.currentSavings >= 0;

  if (!expensesOk || targetMonths === null || !savingsOk) {
    return emptyResult;
  }

  const monthlyExpenses = input.monthlyExpenses;
  const currentSavings = input.currentSavings;
  const targetFund = monthlyExpenses * targetMonths;
  const rawGap = targetFund - currentSavings;
  const gap = Math.max(0, rawGap);
  const surplus = Math.max(0, -rawGap);
  const funded = gap === 0;

  const threeMonthTarget = monthlyExpenses * 3;
  const sixMonthTarget = monthlyExpenses * 6;
  const threeMonthGap = remainingGap(threeMonthTarget, currentSavings);
  const sixMonthGap = remainingGap(sixMonthTarget, currentSavings);

  const contributionOk =
    isFiniteNumber(input.monthlyContribution) && input.monthlyContribution > 0;

  let monthsToFund: number | null = null;
  let monthsToFundExact: number | null = null;

  if (funded) {
    monthsToFund = 0;
    monthsToFundExact = 0;
  } else if (contributionOk) {
    monthsToFundExact = gap / input.monthlyContribution;
    monthsToFund = Math.ceil(monthsToFundExact);
  }

  return {
    valid: true,
    monthlyExpenses,
    targetMonths,
    targetFund,
    currentSavings,
    gap,
    surplus,
    funded,
    monthsToFund,
    monthsToFundExact,
    threeMonthTarget,
    sixMonthTarget,
    threeMonthGap,
    sixMonthGap,
  };
}
