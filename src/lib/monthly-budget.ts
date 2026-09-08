export const EXPENSE_CATEGORIES = [
  { id: "housing", label: "Housing" },
  { id: "utilities", label: "Utilities" },
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "debt", label: "Debt" },
  { id: "savings", label: "Savings" },
  { id: "other", label: "Other" },
] as const;

export type ExpenseCategoryId = (typeof EXPENSE_CATEGORIES)[number]["id"];

export const NEED_CATEGORIES = [
  "housing",
  "utilities",
  "food",
  "transport",
  "debt",
] as const satisfies readonly ExpenseCategoryId[];

export const WANT_CATEGORIES = ["other"] as const satisfies readonly ExpenseCategoryId[];
export const SAVINGS_CATEGORIES = ["savings"] as const satisfies readonly ExpenseCategoryId[];

export type BudgetLineInput = {
  amount: number;
  label?: string;
  category?: ExpenseCategoryId;
};

export type MonthlyBudgetInput = {
  incomeLines: BudgetLineInput[];
  expenseLines: BudgetLineInput[];
};

export type BudgetStatus = "surplus" | "deficit" | "balanced";

export type MonthlyBudgetResult = {
  valid: boolean;
  totalIncome: number | null;
  totalExpenses: number | null;
  remaining: number | null;
  status: BudgetStatus | null;
  savingsTotal: number | null;
  savingsRatePercent: number | null;
  needsTotal: number | null;
  wantsTotal: number | null;
  needsPercent: number | null;
  wantsPercent: number | null;
  expensesByCategory: Record<ExpenseCategoryId, number> | null;
};

export const DEFAULT_INCOME_LINES = [
  { id: "income-1", label: "Paycheck", amount: 4200 },
  { id: "income-2", label: "Side income", amount: 400 },
] as const;

export const DEFAULT_EXPENSE_LINES = [
  { id: "expense-1", category: "housing" as const, label: "Rent", amount: 1600 },
  { id: "expense-2", category: "utilities" as const, label: "Electric & water", amount: 180 },
  { id: "expense-3", category: "food" as const, label: "Groceries", amount: 550 },
  { id: "expense-4", category: "transport" as const, label: "Gas & transit", amount: 220 },
  { id: "expense-5", category: "debt" as const, label: "Credit card", amount: 250 },
  { id: "expense-6", category: "savings" as const, label: "Emergency fund", amount: 400 },
  { id: "expense-7", category: "other" as const, label: "Subscriptions", amount: 80 },
] as const;

const emptyResult: MonthlyBudgetResult = {
  valid: false,
  totalIncome: null,
  totalExpenses: null,
  remaining: null,
  status: null,
  savingsTotal: null,
  savingsRatePercent: null,
  needsTotal: null,
  wantsTotal: null,
  needsPercent: null,
  wantsPercent: null,
  expensesByCategory: null,
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function isEmptyAmount(value: number): boolean {
  return Number.isNaN(value);
}

function isUsableAmount(value: number): boolean {
  return isFiniteNumber(value) && value >= 0;
}

export function isExpenseCategory(value: string): value is ExpenseCategoryId {
  return EXPENSE_CATEGORIES.some((item) => item.id === value);
}

export function emptyCategoryTotals(): Record<ExpenseCategoryId, number> {
  return {
    housing: 0,
    utilities: 0,
    food: 0,
    transport: 0,
    debt: 0,
    savings: 0,
    other: 0,
  };
}

export function sumBudgetLines(lines: { amount: number }[]): number | null {
  let total = 0;
  for (const line of lines) {
    if (isEmptyAmount(line.amount)) continue;
    if (!isUsableAmount(line.amount)) return null;
    total += line.amount;
  }
  return total;
}

export function computeSavingsRatePercent(
  savings: number,
  income: number,
): number | null {
  if (!isUsableAmount(savings) || !isUsableAmount(income) || income === 0) {
    return null;
  }
  return (savings / income) * 100;
}

function shareOfIncome(part: number, income: number): number | null {
  if (!isUsableAmount(part) || !isUsableAmount(income) || income === 0) {
    return null;
  }
  return (part / income) * 100;
}

function sumCategories(
  totals: Record<ExpenseCategoryId, number>,
  categories: readonly ExpenseCategoryId[],
): number {
  return categories.reduce((sum, id) => sum + totals[id], 0);
}

export function computeMonthlyBudget(input: MonthlyBudgetInput): MonthlyBudgetResult {
  const totalIncome = sumBudgetLines(input.incomeLines);
  const totalExpenses = sumBudgetLines(input.expenseLines);

  if (totalIncome === null || totalExpenses === null) {
    return emptyResult;
  }

  const expensesByCategory = emptyCategoryTotals();
  for (const line of input.expenseLines) {
    if (isEmptyAmount(line.amount)) continue;
    if (!isUsableAmount(line.amount)) return emptyResult;
    const category =
      line.category && isExpenseCategory(line.category) ? line.category : "other";
    expensesByCategory[category] += line.amount;
  }

  const remaining = totalIncome - totalExpenses;
  const status: BudgetStatus =
    remaining > 0 ? "surplus" : remaining < 0 ? "deficit" : "balanced";
  const savingsTotal = sumCategories(expensesByCategory, SAVINGS_CATEGORIES);
  const needsTotal = sumCategories(expensesByCategory, NEED_CATEGORIES);
  const wantsTotal = sumCategories(expensesByCategory, WANT_CATEGORIES);

  return {
    valid: true,
    totalIncome,
    totalExpenses,
    remaining,
    status,
    savingsTotal,
    savingsRatePercent: computeSavingsRatePercent(savingsTotal, totalIncome),
    needsTotal,
    wantsTotal,
    needsPercent: shareOfIncome(needsTotal, totalIncome),
    wantsPercent: shareOfIncome(wantsTotal, totalIncome),
    expensesByCategory,
  };
}

function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })}%`;
}

export function formatBudgetSummary(
  result: MonthlyBudgetResult,
  lines?: {
    incomeLines?: { label: string; amount: number }[];
    expenseLines?: { label: string; category: ExpenseCategoryId; amount: number }[];
  },
): string {
  if (!result.valid) return "";

  const statusLabel =
    result.status === "surplus"
      ? "Surplus"
      : result.status === "deficit"
        ? "Deficit"
        : "Balanced";

  const parts = ["Monthly budget summary", ""];

  if (lines?.incomeLines?.length) {
    parts.push("Income");
    for (const line of lines.incomeLines) {
      if (!isUsableAmount(line.amount)) continue;
      const name = line.label.trim() || "Income";
      parts.push(`- ${name}: ${money(line.amount)}`);
    }
    parts.push("");
  }

  if (lines?.expenseLines?.length) {
    parts.push("Expenses");
    for (const line of lines.expenseLines) {
      if (!isUsableAmount(line.amount)) continue;
      const category = EXPENSE_CATEGORIES.find((item) => item.id === line.category)?.label ?? "Other";
      const name = line.label.trim() || category;
      parts.push(`- ${name} (${category}): ${money(line.amount)}`);
    }
    parts.push("");
  }

  parts.push(`Total income: ${money(result.totalIncome)}`);
  parts.push(`Total expenses: ${money(result.totalExpenses)}`);
  parts.push(`Remaining (${statusLabel}): ${money(result.remaining)}`);
  if (result.savingsRatePercent !== null) {
    parts.push(`Savings rate: ${percent(result.savingsRatePercent)}`);
  }

  return parts.join("\n").trim();
}
