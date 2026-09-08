"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  DEFAULT_EXPENSE_LINES,
  DEFAULT_INCOME_LINES,
  EXPENSE_CATEGORIES,
  computeMonthlyBudget,
  formatBudgetSummary,
  type ExpenseCategoryId,
} from "@/lib/monthly-budget";

type IncomeDraft = {
  id: string;
  label: string;
  amount: string;
};

type ExpenseDraft = {
  id: string;
  category: ExpenseCategoryId;
  label: string;
  amount: string;
};

function newIncome(id: string): IncomeDraft {
  return { id, label: "", amount: "" };
}

function newExpense(id: string, category: ExpenseCategoryId = "other"): ExpenseDraft {
  return { id, category, label: "", amount: "" };
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })}%`;
}

export function MonthlyBudgetTemplate() {
  const [incomeLines, setIncomeLines] = useState<IncomeDraft[]>(
    DEFAULT_INCOME_LINES.map((line) => ({
      id: line.id,
      label: line.label,
      amount: String(line.amount),
    })),
  );
  const [expenseLines, setExpenseLines] = useState<ExpenseDraft[]>(
    DEFAULT_EXPENSE_LINES.map((line) => ({
      id: line.id,
      category: line.category,
      label: line.label,
      amount: String(line.amount),
    })),
  );
  const [nextIncome, setNextIncome] = useState(DEFAULT_INCOME_LINES.length + 1);
  const [nextExpense, setNextExpense] = useState(DEFAULT_EXPENSE_LINES.length + 1);

  const parsedIncome = incomeLines.map((line) => ({
    label: line.label,
    amount: parseAmount(line.amount),
  }));
  const parsedExpenses = expenseLines.map((line) => ({
    label: line.label,
    category: line.category,
    amount: parseAmount(line.amount),
  }));

  const result = computeMonthlyBudget({
    incomeLines: parsedIncome,
    expenseLines: parsedExpenses,
  });

  const remainingLabel =
    result.status === "deficit"
      ? "Remaining (deficit)"
      : result.status === "balanced"
        ? "Remaining (balanced)"
        : "Remaining (surplus)";

  const summary = formatBudgetSummary(result, {
    incomeLines: parsedIncome.map((line) => ({
      label: line.label,
      amount: Number.isFinite(line.amount) ? line.amount : Number.NaN,
    })),
    expenseLines: parsedExpenses.map((line) => ({
      label: line.label,
      category: line.category,
      amount: Number.isFinite(line.amount) ? line.amount : Number.NaN,
    })),
  });

  function updateIncome(id: string, field: keyof Omit<IncomeDraft, "id">, value: string) {
    setIncomeLines((current) =>
      current.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    );
  }

  function updateExpense(
    id: string,
    field: keyof Omit<ExpenseDraft, "id">,
    value: string,
  ) {
    setExpenseLines((current) =>
      current.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-6 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-sm font-semibold">Income</h2>
            <button
              type="button"
              onClick={() => {
                setIncomeLines((current) => [...current, newIncome(`income-${nextIncome}`)]);
                setNextIncome((value) => value + 1);
              }}
              className="btn-primary btn-primary-sm"
            >
              Add income
            </button>
          </div>
          <ol className="space-y-3">
            {incomeLines.map((line, index) => (
              <li
                key={line.id}
                className="rounded-[12px] border border-line bg-surface p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Income {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIncomeLines((current) =>
                        current.length === 1
                          ? [newIncome(`income-${nextIncome}`)]
                          : current.filter((item) => item.id !== line.id),
                      );
                      if (incomeLines.length === 1) setNextIncome((value) => value + 1);
                    }}
                    className="text-sm font-medium text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Label</span>
                    <input
                      type="text"
                      autoComplete="off"
                      value={line.label}
                      onChange={(event) => updateIncome(line.id, "label", event.target.value)}
                      className="input-field"
                      placeholder="Paycheck"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Monthly amount</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={line.amount}
                      onChange={(event) => updateIncome(line.id, "amount", event.target.value)}
                      className="input-field"
                      placeholder="4200"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-sm font-semibold">Expenses</h2>
            <button
              type="button"
              onClick={() => {
                setExpenseLines((current) => [
                  ...current,
                  newExpense(`expense-${nextExpense}`),
                ]);
                setNextExpense((value) => value + 1);
              }}
              className="btn-primary btn-primary-sm"
            >
              Add expense
            </button>
          </div>
          <ol className="space-y-3">
            {expenseLines.map((line, index) => (
              <li
                key={line.id}
                className="rounded-[12px] border border-line bg-surface p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Expense {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setExpenseLines((current) =>
                        current.length === 1
                          ? [newExpense(`expense-${nextExpense}`)]
                          : current.filter((item) => item.id !== line.id),
                      );
                      if (expenseLines.length === 1) setNextExpense((value) => value + 1);
                    }}
                    className="text-sm font-medium text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Category</span>
                    <select
                      value={line.category}
                      onChange={(event) =>
                        updateExpense(
                          line.id,
                          "category",
                          event.target.value as ExpenseCategoryId,
                        )
                      }
                      className="input-field"
                    >
                      {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Label</span>
                    <input
                      type="text"
                      autoComplete="off"
                      value={line.label}
                      onChange={(event) =>
                        updateExpense(line.id, "label", event.target.value)
                      }
                      className="input-field"
                      placeholder="Rent"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Monthly amount</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={line.amount}
                      onChange={(event) =>
                        updateExpense(line.id, "amount", event.target.value)
                      }
                      className="input-field"
                      placeholder="1600"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-sm leading-6 text-muted">
          Educational estimate only — not financial advice. Numbers stay on this
          device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Monthly budget</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow label="Total income" value={money(result.totalIncome)} emphasize />
          <ResultRow label="Total expenses" value={money(result.totalExpenses)} />
          <ResultRow
            label={remainingLabel}
            value={money(result.remaining)}
            tone={
              result.status === "deficit"
                ? "danger"
                : result.status === "surplus"
                  ? "mint"
                  : undefined
            }
          />
          <ResultRow label="Savings rate" value={percent(result.savingsRatePercent)} />

          {result.expensesByCategory ? (
            <div className="border-t border-line pt-3">
              <dt className="text-muted">By category</dt>
              <dd className="mt-2 space-y-2">
                {EXPENSE_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <span className="text-muted">{category.label}</span>
                    <span className="font-mono font-medium tabular-nums">
                      {money(result.expensesByCategory?.[category.id] ?? 0)}
                    </span>
                  </div>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>

        {!result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter monthly amounts of 0 or more. Blank rows are skipped. Negative
            amounts are not used.
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            <CopyButton
              value={summary}
              label="Copy summary"
              copiedLabel="Copied"
              variant="secondary"
              className="btn-primary-sm"
            />
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary btn-primary-sm"
            >
              Print
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasize = false,
  tone,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  tone?: "mint" | "danger";
}) {
  const valueClass =
    tone === "danger"
      ? "text-lg text-danger"
      : tone === "mint" || emphasize
        ? "text-lg text-mint"
        : "";

  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-mono font-medium tabular-nums ${valueClass}`}>{value}</dd>
    </div>
  );
}
