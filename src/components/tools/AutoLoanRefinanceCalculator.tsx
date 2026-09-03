"use client";

import { useState } from "react";
import { computeAutoLoanRefinance } from "@/lib/auto-loan-refinance";

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
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

export function AutoLoanRefinanceCalculator() {
  const [currentBalance, setCurrentBalance] = useState("18000");
  const [currentRatePercent, setCurrentRatePercent] = useState("8.5");
  const [remainingYears, setRemainingYears] = useState("3");
  const [remainingExtraMonths, setRemainingExtraMonths] = useState("0");
  const [newRatePercent, setNewRatePercent] = useState("5.9");
  const [newTermMonths, setNewTermMonths] = useState("36");
  const [fees, setFees] = useState("399");
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState("");

  const result = computeAutoLoanRefinance({
    currentBalance: parseAmount(currentBalance),
    currentRatePercent: parseAmount(currentRatePercent),
    remainingYears: parseAmount(remainingYears),
    remainingExtraMonths:
      remainingExtraMonths.trim() === "" ? 0 : parseAmount(remainingExtraMonths),
    newRatePercent: parseAmount(newRatePercent),
    newTermMonths: parseAmount(newTermMonths),
    fees: fees.trim() === "" ? 0 : parseAmount(fees),
    extraMonthlyPayment:
      extraMonthlyPayment.trim() === "" ? 0 : parseAmount(extraMonthlyPayment),
  });

  const hasExtra = result.extraMonthlyPayment > 0;
  const hasFees = result.fees > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-text">Current loan</legend>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Current loan balance</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={currentBalance}
              onChange={(event) => setCurrentBalance(event.target.value)}
              className="input-field"
              placeholder="18000"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Current interest rate (annual %)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={currentRatePercent}
              onChange={(event) => setCurrentRatePercent(event.target.value)}
              className="input-field"
              placeholder="8.50"
            />
          </label>

          <fieldset className="mt-4">
            <legend className="mb-2 block text-xs text-muted">
              Remaining term (years + months, or months only)
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-xs text-muted">Years</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={remainingYears}
                  onChange={(event) => setRemainingYears(event.target.value)}
                  className="input-field"
                  placeholder="3"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs text-muted">Extra months</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={remainingExtraMonths}
                  onChange={(event) => setRemainingExtraMonths(event.target.value)}
                  className="input-field"
                  placeholder="0"
                />
              </label>
            </div>
            <span className="mt-2 block text-sm text-muted">
              Use 0 years and a month count if you only know remaining months.
            </span>
          </fieldset>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-text">Refinance offer</legend>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">
              New refinance rate (annual %)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={newRatePercent}
              onChange={(event) => setNewRatePercent(event.target.value)}
              className="input-field"
              placeholder="5.90"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">New term (months)</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={newTermMonths}
              onChange={(event) => setNewTermMonths(event.target.value)}
              className="input-field"
              placeholder="36"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Fees / closing costs (optional)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={fees}
              onChange={(event) => setFees(event.target.value)}
              className="input-field"
              placeholder="0"
            />
            <span className="mt-2 block text-muted">
              Paid at closing. Used for break-even months and total cost.
            </span>
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Extra monthly payment (optional)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={extraMonthlyPayment}
              onChange={(event) => setExtraMonthlyPayment(event.target.value)}
              className="input-field"
              placeholder="0"
            />
            <span className="mt-2 block text-muted">
              Added on top of the new payment to cut interest and payoff time.
            </span>
          </label>
        </fieldset>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Refinance comparison</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="New monthly payment"
            value={money(result.newMonthlyPayment)}
            emphasize
          />
          <ResultRow label="Current monthly payment" value={money(result.currentMonthlyPayment)} />
          <ResultRow label="Monthly savings" value={money(result.monthlySavings)} />
          {hasExtra ? (
            <>
              <ResultRow
                label="Payment with extra"
                value={money(result.newPaymentWithExtra)}
              />
              <ResultRow
                label="Months to pay off (new)"
                value={monthsLabel(result.newMonthsToPayoff)}
              />
            </>
          ) : null}

          <div className="border-t border-line pt-3">
            <ResultRow
              label="Current total interest"
              value={money(result.currentTotalInterest)}
            />
            <div className="mt-3">
              <ResultRow label="New total interest" value={money(result.newTotalInterest)} />
            </div>
            <div className="mt-3">
              <ResultRow label="Interest savings" value={money(result.interestSavings)} />
            </div>
          </div>

          <div className="border-t border-line pt-3">
            {hasFees ? (
              <div className="mb-3">
                <ResultRow
                  label="Break-even on fees"
                  value={
                    result.neverBreaksEven
                      ? "Never"
                      : result.breakEvenMonths === null
                        ? "—"
                        : `${monthsLabel(result.breakEvenMonths)} mo`
                  }
                />
              </div>
            ) : null}
            <ResultRow
              label="Current remaining cost"
              value={money(result.currentTotalCost)}
            />
            <div className="mt-3">
              <ResultRow
                label={hasFees ? "New total cost (incl. fees)" : "New total cost"}
                value={money(result.newTotalCost)}
              />
            </div>
            <div className="mt-3">
              <ResultRow label="Total cost difference" value={money(result.totalCostSavings)} />
            </div>
          </div>
        </dl>
        {!result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter a current balance, rates of 0% or more, a remaining term of at
            least one month, a new term of at least one month, and fees or extra
            payments of 0 or more.
          </p>
        ) : null}
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
