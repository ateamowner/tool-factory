"use client";

import { useState } from "react";
import {
  COMPOUNDING_OPTIONS,
  computeCdRate,
  formatPercent,
  formatUsd,
  type CdCompounding,
  type CdRateMode,
  type CdTermUnit,
} from "@/lib/cd-rate";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function yearLabel(year: number, fraction: number): string {
  if (Math.abs(fraction - 1) < 1e-9) return String(year);
  const shown = fraction.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
  });
  return `${year} (${shown} yr)`;
}

export function CdRateCalculator() {
  const [deposit, setDeposit] = useState("10000");
  const [mode, setMode] = useState<CdRateMode>("apy");
  const [ratePercent, setRatePercent] = useState("4.5");
  const [term, setTerm] = useState("12");
  const [termUnit, setTermUnit] = useState<CdTermUnit>("months");
  const [compounding, setCompounding] = useState<CdCompounding>("monthly");

  const result = computeCdRate({
    deposit: parseAmount(deposit),
    ratePercent: parseAmount(ratePercent),
    mode,
    term: parseAmount(term),
    termUnit,
    compounding,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Deposit amount</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={deposit}
            onChange={(event) => setDeposit(event.target.value)}
            className="input-field"
            placeholder="10000"
          />
          <span className="mt-2 block text-muted">
            Opening certificate of deposit balance. Must be greater than 0.
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Rate type</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "apy", label: "APY" },
                { id: "nominal", label: "Interest rate" },
              ] as const
            ).map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="cd-rate-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Banks usually quote APY. Interest rate is the nominal annual rate
            before compounding.
          </p>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            {mode === "apy" ? "APY %" : "Interest rate %"}
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={ratePercent}
            onChange={(event) => setRatePercent(event.target.value)}
            className="input-field"
            placeholder="4.5"
          />
          <span className="mt-2 block text-muted">
            Annual percent. 0% is allowed; must be 100% or less.
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Term</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              className="input-field"
              placeholder="12"
            />
          </label>
          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Term unit</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "months", label: "Months" },
                  { id: "years", label: "Years" },
                ] as const
              ).map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="cd-term-unit"
                    value={option.id}
                    checked={termUnit === option.id}
                    onChange={() => setTermUnit(option.id)}
                    className="accent-mint"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Compounding frequency</span>
          <select
            className="input-field"
            value={compounding}
            onChange={(event) => setCompounding(event.target.value as CdCompounding)}
          >
            {COMPOUNDING_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-muted">
            Used to convert a nominal rate to APY, or APY back to a nominal
            rate. Daily uses 365 periods.
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
        <h2 className="text-lg font-semibold">CD results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Ending balance"
            value={
              result.valid && result.endingBalance !== null
                ? formatUsd(result.endingBalance)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Interest earned"
            value={
              result.valid && result.interestEarned !== null
                ? formatUsd(result.interestEarned)
                : "—"
            }
          />
          <ResultRow
            label="APY"
            value={
              result.valid && result.apyPercent !== null
                ? formatPercent(result.apyPercent)
                : "—"
            }
          />
          <ResultRow
            label="Interest rate"
            value={
              result.valid && result.nominalPercent !== null
                ? formatPercent(result.nominalPercent)
                : "—"
            }
          />
          <ResultRow
            label="Yield over term"
            value={
              result.valid && result.effectiveYieldPercent !== null
                ? formatPercent(result.effectiveYieldPercent)
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{result.summary}</p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational estimate, not financial advice. Posted CD APYs, day-count
            conventions, early-withdrawal penalties, and taxes can differ.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter a deposit greater than 0, an APY or interest rate from 0% to 100%, and a term greater than 0."}
          </p>
        )}
      </aside>

      {result.valid && result.schedule.length > 0 ? (
        <div className="rounded-2xl border border-line bg-card p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Year-by-year schedule</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-3 font-medium">Year</th>
                  <th className="py-2 pr-3 font-medium">Beginning balance</th>
                  <th className="py-2 pr-3 font-medium">Interest</th>
                  <th className="py-2 font-medium">Ending balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={`${row.year}-${row.yearFraction}`} className="border-b border-line/70">
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {yearLabel(row.year, row.yearFraction)}
                    </td>
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {formatUsd(row.beginningBalance)}
                    </td>
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {formatUsd(row.interest)}
                    </td>
                    <td className="py-2 font-mono tabular-nums">
                      {formatUsd(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
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
