"use client";

import { useState } from "react";
import { computeMortgageRecast } from "@/lib/mortgage-recast";

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

export function MortgageRecastCalculator() {
  const [remainingBalance, setRemainingBalance] = useState("250000");
  const [annualRatePercent, setAnnualRatePercent] = useState("6.5");
  const [remainingYears, setRemainingYears] = useState("24");
  const [remainingExtraMonths, setRemainingExtraMonths] = useState("0");
  const [lumpSum, setLumpSum] = useState("25000");

  const result = computeMortgageRecast({
    remainingBalance: parseAmount(remainingBalance),
    annualRatePercent: parseAmount(annualRatePercent),
    remainingYears: parseAmount(remainingYears),
    remainingExtraMonths:
      remainingExtraMonths.trim() === "" ? 0 : parseAmount(remainingExtraMonths),
    lumpSum: lumpSum.trim() === "" ? 0 : parseAmount(lumpSum),
  });

  const lumpExceedsBalance =
    Number.isFinite(parseAmount(remainingBalance)) &&
    Number.isFinite(parseAmount(lumpSum)) &&
    parseAmount(lumpSum) > parseAmount(remainingBalance);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Remaining loan balance</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={remainingBalance}
            onChange={(event) => setRemainingBalance(event.target.value)}
            className="input-field"
            placeholder="250000"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Interest rate (annual %)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={annualRatePercent}
            onChange={(event) => setAnnualRatePercent(event.target.value)}
            className="input-field"
            placeholder="6.50"
          />
          <span className="mt-2 block text-muted">
            Recast keeps this rate. It does not refinance the loan.
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Remaining term</legend>
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
                placeholder="24"
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
            Recast keeps this remaining term and lowers the monthly payment.
          </span>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Lump-sum principal payment
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={lumpSum}
            onChange={(event) => setLumpSum(event.target.value)}
            className="input-field"
            placeholder="25000"
          />
          <span className="mt-2 block text-muted">
            Applied to principal, then the loan is re-amortized.
            {lumpExceedsBalance ? " Lump sum cannot exceed the remaining balance." : ""}
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
        <h2 className="text-lg font-semibold">After recast</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="New monthly payment"
            value={money(result.newMonthlyPayment)}
            emphasize
          />
          <ResultRow label="Payment drop" value={money(result.paymentDrop)} />
          <ResultRow
            label="Interest savings"
            value={money(result.interestSavings)}
          />
          <div className="border-t border-line pt-3">
            <ResultRow
              label="Current monthly payment"
              value={money(result.currentMonthlyPayment)}
            />
            <div className="mt-3">
              <ResultRow label="New balance" value={money(result.newBalance)} />
            </div>
            <div className="mt-3">
              <ResultRow
                label="Interest left without recast"
                value={money(result.interestWithoutRecast)}
              />
            </div>
            <div className="mt-3">
              <ResultRow
                label="Interest left after recast"
                value={money(result.interestWithRecast)}
              />
            </div>
          </div>
        </dl>
        {result.paidOff ? (
          <p className="mt-4 text-sm leading-6 text-mint">
            The lump sum pays the loan off. There is no remaining payment.
          </p>
        ) : null}
        {!result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter a remaining balance, a rate of 0% or more, a remaining term of
            at least one month, and a lump sum that does not exceed the balance.
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
