import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  DEFAULT_EXPENSE_LINES,
  DEFAULT_INCOME_LINES,
  computeMonthlyBudget,
  computeSavingsRatePercent,
  formatBudgetSummary,
  sumBudgetLines,
} from "./monthly-budget.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

const sample = {
  incomeLines: DEFAULT_INCOME_LINES.map((line) => ({ amount: line.amount })),
  expenseLines: DEFAULT_EXPENSE_LINES.map((line) => ({
    amount: line.amount,
    category: line.category,
  })),
};

describe("sumBudgetLines", () => {
  it("adds finite non-negative amounts and skips empty NaN rows", () => {
    assert.equal(sumBudgetLines([{ amount: 100 }, { amount: 50.25 }]), 150.25);
    assert.equal(sumBudgetLines([{ amount: Number.NaN }, { amount: 80 }]), 80);
    assert.equal(sumBudgetLines([]), 0);
  });

  it("rejects a negative or non-finite amount", () => {
    assert.equal(sumBudgetLines([{ amount: -1 }]), null);
    assert.equal(sumBudgetLines([{ amount: Number.POSITIVE_INFINITY }]), null);
  });
});

describe("computeSavingsRatePercent", () => {
  it("is savings divided by income when income is above 0", () => {
    assert.equal(computeSavingsRatePercent(400, 4_000), 10);
    assert.equal(cents(computeSavingsRatePercent(400, 4_600)), 8.7);
  });

  it("is null when income is 0 or a value is invalid", () => {
    assert.equal(computeSavingsRatePercent(100, 0), null);
    assert.equal(computeSavingsRatePercent(-1, 4_000), null);
    assert.equal(computeSavingsRatePercent(100, Number.NaN), null);
  });
});

describe("computeMonthlyBudget", () => {
  it("totals the default sample as a surplus with a savings rate", () => {
    const result = computeMonthlyBudget(sample);

    assert.equal(result.valid, true);
    assert.equal(result.totalIncome, 4_600);
    assert.equal(result.totalExpenses, 3_280);
    assert.equal(result.remaining, 1_320);
    assert.equal(result.status, "surplus");
    assert.equal(result.savingsTotal, 400);
    assert.equal(cents(result.savingsRatePercent), 8.7);
    assert.equal(result.needsTotal, 2_800);
    assert.equal(result.wantsTotal, 80);
    assert.equal(result.expensesByCategory?.housing, 1_600);
    assert.equal(result.expensesByCategory?.food, 550);
  });

  it("flags a deficit when expenses exceed income", () => {
    const result = computeMonthlyBudget({
      incomeLines: [{ amount: 2_000 }],
      expenseLines: [
        { amount: 1_600, category: "housing" },
        { amount: 800, category: "food" },
      ],
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalIncome, 2_000);
    assert.equal(result.totalExpenses, 2_400);
    assert.equal(result.remaining, -400);
    assert.equal(result.status, "deficit");
    assert.equal(result.savingsRatePercent, 0);
  });

  it("is balanced when income equals expenses, including savings", () => {
    const result = computeMonthlyBudget({
      incomeLines: [{ amount: 3_000 }],
      expenseLines: [
        { amount: 2_400, category: "housing" },
        { amount: 600, category: "savings" },
      ],
    });

    assert.equal(result.valid, true);
    assert.equal(result.remaining, 0);
    assert.equal(result.status, "balanced");
    assert.equal(result.savingsRatePercent, 20);
  });

  it("treats an unknown expense category as other and skips blank rows", () => {
    const result = computeMonthlyBudget({
      incomeLines: [{ amount: 1_000 }, { amount: Number.NaN }],
      expenseLines: [{ amount: 250 }, { amount: Number.NaN, category: "food" }],
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalIncome, 1_000);
    assert.equal(result.totalExpenses, 250);
    assert.equal(result.expensesByCategory?.other, 250);
    assert.equal(result.expensesByCategory?.food, 0);
  });

  it("rejects a negative income or expense line", () => {
    assert.equal(
      computeMonthlyBudget({
        incomeLines: [{ amount: -10 }],
        expenseLines: [{ amount: 100, category: "food" }],
      }).valid,
      false,
    );
    assert.equal(
      computeMonthlyBudget({
        incomeLines: [{ amount: 100 }],
        expenseLines: [{ amount: -5, category: "food" }],
      }).valid,
      false,
    );
  });
});

describe("formatBudgetSummary", () => {
  it("returns an empty string when the budget is invalid", () => {
    assert.equal(
      formatBudgetSummary({
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
      }),
      "",
    );
  });

  it("prints totals, remaining status, and optional line items", () => {
    const result = computeMonthlyBudget({
      incomeLines: [{ amount: 3_000, label: "Paycheck" }],
      expenseLines: [{ amount: 1_200, category: "housing", label: "Rent" }],
    });
    const summary = formatBudgetSummary(result, {
      incomeLines: [{ label: "Paycheck", amount: 3_000 }],
      expenseLines: [{ label: "Rent", category: "housing", amount: 1_200 }],
    });

    assert.match(summary, /Total income: \$3,000\.00/);
    assert.match(summary, /Total expenses: \$1,200\.00/);
    assert.match(summary, /Remaining \(Surplus\): \$1,800\.00/);
    assert.match(summary, /- Paycheck: \$3,000\.00/);
    assert.match(summary, /- Rent \(Housing\): \$1,200\.00/);
  });
});

describe("FAQPage JSON-LD shape for monthly budget template", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a monthly budget template work?",
        answer:
          "Add income and expense lines, then subtract total expenses from total income to see the leftover surplus or a deficit.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
