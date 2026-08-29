"use client";

import { useState } from "react";
import {
  DEFAULT_TARGET_MONTHS,
  EXPENSE_LINE_ITEMS,
  TARGET_MONTH_PRESETS,
  computeEmergencyFund,
  sumExpenseLines,
  type ExpenseLineId,
} from "@/lib/emergency-fund";

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

function monthsLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

const emptyLines = Object.fromEntries(
  EXPENSE_LINE_ITEMS.map((item) => [item.id, ""]),
) as Record<ExpenseLineId, string>;

export function EmergencyFundCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState("3000");
  const [targetMonths, setTargetMonths] = useState(String(DEFAULT_TARGET_MONTHS));
  const [currentSavings, setCurrentSavings] = useState("0");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [lines, setLines] = useState(emptyLines);

  const parsedLines = Object.fromEntries(
    EXPENSE_LINE_ITEMS.map((item) => [item.id, parseAmount(lines[item.id])]),
  );
  const breakdownTotal = sumExpenseLines(parsedLines);
  const hasBreakdown = EXPENSE_LINE_ITEMS.some((item) => lines[item.id].trim() !== "");

  const result = computeEmergencyFund({
    monthlyExpenses: parseAmount(monthlyExpenses),
    targetMonths: parseAmount(targetMonths),
    currentSavings: currentSavings.trim() === "" ? 0 : parseAmount(currentSavings),
    monthlyContribution:
      monthlyContribution.trim() === "" ? 0 : parseAmount(monthlyContribution),
  });

  function updateLine(id: ExpenseLineId, value: string) {
    const next = { ...lines, [id]: value };
    setLines(next);
    const nextParsed = Object.fromEntries(
      EXPENSE_LINE_ITEMS.map((item) => [item.id, parseAmount(next[item.id])]),
    );
    if (EXPENSE_LINE_ITEMS.some((item) => next[item.id].trim() !== "")) {
      setMonthlyExpenses(String(sumExpenseLines(nextParsed)));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Monthly essential expenses
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={monthlyExpenses}
            onChange={(event) => setMonthlyExpenses(event.target.value)}
            className="input-field"
            placeholder="3000"
          />
          <span className="mt-2 block text-muted">
            Housing, food, utilities, insurance, transport, and debt minimums.
            {hasBreakdown ? ` Breakdown totals ${money(breakdownTotal)}.` : ""}
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">
            Optional expense breakdown
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {EXPENSE_LINE_ITEMS.map((item) => (
              <label key={item.id} className="block text-sm">
                <span className="mb-2 block text-xs text-muted">{item.label}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={lines[item.id]}
                  onChange={(event) => updateLine(item.id, event.target.value)}
                  className="input-field"
                  placeholder="0"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">
            Target months of expenses
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {TARGET_MONTH_PRESETS.map((months) => (
              <label
                key={months}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="target-months"
                  value={months}
                  checked={targetMonths === String(months)}
                  onChange={() => setTargetMonths(String(months))}
                  className="accent-mint"
                />
                {months}
              </label>
            ))}
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-2 block text-xs text-muted">Custom (3–12)</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={targetMonths}
              onChange={(event) => setTargetMonths(event.target.value)}
              className="input-field max-w-xs"
              placeholder="6"
            />
          </label>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Current emergency savings</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={currentSavings}
            onChange={(event) => setCurrentSavings(event.target.value)}
            className="input-field"
            placeholder="0.00"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Monthly contribution (optional)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={monthlyContribution}
            onChange={(event) => setMonthlyContribution(event.target.value)}
            className="input-field"
            placeholder="250"
          />
          <span className="mt-2 block text-muted">
            Used to estimate how many months until the fund is full.
          </span>
        </label>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Emergency fund</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label={`Target (${result.targetMonths ?? "—"} months)`}
            value={money(result.targetFund)}
            emphasize
          />
          <ResultRow label="Current savings" value={money(result.currentSavings)} />
          <ResultRow
            label={result.funded ? "Surplus" : "Gap to target"}
            value={money(result.funded ? result.surplus : result.gap)}
          />
          <ResultRow
            label="Months to fully fund"
            value={monthsLabel(result.monthsToFund)}
          />
          <div className="border-t border-line pt-3">
            <dt className="text-muted">3-month vs 6-month</dt>
            <dd className="mt-2 space-y-2">
              <ComparisonRow
                label="3 months"
                target={result.threeMonthTarget}
                gap={result.threeMonthGap}
              />
              <ComparisonRow
                label="6 months"
                target={result.sixMonthTarget}
                gap={result.sixMonthGap}
              />
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function ComparisonRow({
  label,
  target,
  gap,
}: {
  label: string;
  target: number | null;
  gap: number | null;
}) {
  const funded = gap === 0;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-mono font-medium tabular-nums">
        {money(target)}
        <span className="mt-0.5 block text-xs font-medium text-muted">
          {target === null
            ? "—"
            : funded
              ? "Funded"
              : `${money(gap)} to go`}
        </span>
      </span>
    </div>
  );
}
