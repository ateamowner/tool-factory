export type CapRateInput = {
  propertyValue: number;
  grossAnnualIncome: number;
  vacancyPercent: number;
  operatingExpenses: number;
  /** When true, operatingExpenses is a percent of effective gross income instead of dollars. */
  expensesArePercent: boolean;
};

export type CapRateResult =
  | { valid: false; error: string }
  | {
      valid: true;
      effectiveGrossIncome: number;
      vacancyLoss: number;
      operatingExpenses: number;
      noi: number;
      capRate: number;
    };

export function roundTo(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round((n + Number.EPSILON) * f) / f;
}

export function computeCapRate(input: CapRateInput): CapRateResult {
  const { propertyValue, grossAnnualIncome, vacancyPercent, operatingExpenses, expensesArePercent } = input;
  if (!Number.isFinite(propertyValue) || propertyValue <= 0) {
    return { valid: false, error: "Enter a property value or purchase price greater than 0." };
  }
  if (!Number.isFinite(grossAnnualIncome) || grossAnnualIncome < 0) {
    return { valid: false, error: "Enter gross annual rental income of 0 or more." };
  }
  if (!Number.isFinite(vacancyPercent) || vacancyPercent < 0 || vacancyPercent > 100) {
    return { valid: false, error: "Vacancy must be between 0 and 100 percent." };
  }
  if (!Number.isFinite(operatingExpenses) || operatingExpenses < 0) {
    return { valid: false, error: "Enter operating expenses of 0 or more." };
  }
  if (expensesArePercent && operatingExpenses > 100) {
    return { valid: false, error: "Expenses as a percent of income cannot be more than 100." };
  }
  const vacancyLoss = grossAnnualIncome * (vacancyPercent / 100);
  const effectiveGrossIncome = grossAnnualIncome - vacancyLoss;
  const expenses = expensesArePercent ? effectiveGrossIncome * (operatingExpenses / 100) : operatingExpenses;
  const noi = effectiveGrossIncome - expenses;
  return {
    valid: true,
    effectiveGrossIncome: roundTo(effectiveGrossIncome, 2),
    vacancyLoss: roundTo(vacancyLoss, 2),
    operatingExpenses: roundTo(expenses, 2),
    noi: roundTo(noi, 2),
    capRate: roundTo((noi / propertyValue) * 100, 2),
  };
}

/** Value implied by a NOI and a target cap rate (percent). */
export function valueFromCapRate(noi: number, capRatePercent: number): number | null {
  if (!Number.isFinite(noi) || !Number.isFinite(capRatePercent) || capRatePercent <= 0) return null;
  return roundTo(noi / (capRatePercent / 100), 2);
}
