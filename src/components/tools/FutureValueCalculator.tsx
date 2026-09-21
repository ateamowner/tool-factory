"use client";

import { useState } from "react";
import {
  COMPOUNDING_OPTIONS,
  CONTRIBUTION_FREQUENCY_OPTIONS,
  computeFutureValue,
  formatPercent,
  formatUsd,
  type FvCompounding,
  type FvContributionFrequency,
  type FvContributionTiming,
} from "@/lib/future-value";

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

export function FutureValueCalculator() {
  const [presentValue, setPresentValue] = useState("10000");
  const [contribution, setContribution] = useState("200");
  const [contributionFrequency, setContributionFrequency] =
    useState<FvContributionFrequency>("monthly");
  const [contributionTiming, setContributionTiming] =
    useState<FvContributionTiming>("end");
  const [ratePercent, setRatePercent] = useState("7");
  const [compounding, setCompounding] = useState<FvCompounding>("monthly");
  const [years, setYears] = useState("10");

  const parsedContribution = contribution.trim() === "" ? 0 : parseAmount(contribution);

  const result = computeFutureValue({
    presentValue: parseAmount(presentValue),
    contribution: parsedContribution,
    contributionFrequency,
    contributionTiming,
    ratePercent: parseAmount(ratePercent),
    compounding,
    years: parseAmount(years),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Initial investment (present value)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={presentValue}
            onChange={(event) => setPresentValue(event.target.value)}
            className="input-field"
            placeholder="10000"
          />
          <span className="mt-2 block text-muted">
            Starting amount today. 0 is allowed if you add contributions.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Periodic contribution (optional)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
            className="input-field"
            placeholder="0"
          />
          <span className="mt-2 block text-muted">
            Extra deposit each contribution period. Leave blank or 0 for a lump
            sum only.
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Contribution frequency</span>
            <select
              className="input-field"
              value={contributionFrequency}
              onChange={(event) =>
                setContributionFrequency(event.target.value as FvContributionFrequency)
              }
            >
              {CONTRIBUTION_FREQUENCY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="mb-2 block text-xs text-muted">When deposited</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "end", label: "End" },
                  { id: "beginning", label: "Start" },
                ] as const
              ).map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="fv-contribution-timing"
                    value={option.id}
                    checked={contributionTiming === option.id}
                    onChange={() => setContributionTiming(option.id)}
                    className="accent-mint"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <p className="text-sm leading-6 text-muted">
          End of period is an ordinary annuity (the usual default). Start of
          period is an annuity due — each deposit compounds one extra interval.
        </p>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Annual interest rate %</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={ratePercent}
            onChange={(event) => setRatePercent(event.target.value)}
            className="input-field"
            placeholder="7"
          />
          <span className="mt-2 block text-muted">
            Nominal annual rate. 0% is allowed; must be 100% or less.
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Compounding frequency</span>
            <select
              className="input-field"
              value={compounding}
              onChange={(event) => setCompounding(event.target.value as FvCompounding)}
            >
              {COMPOUNDING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Number of years</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              className="input-field"
              placeholder="10"
            />
          </label>
        </div>
        <p className="text-sm leading-6 text-muted">
          Daily uses 365 periods. When contribution frequency differs from
          compounding, deposits use the effective rate per contribution period.
        </p>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Future value results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Future value"
            value={
              result.valid && result.futureValue !== null
                ? formatUsd(result.futureValue)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Total contributions"
            value={
              result.valid && result.totalContributions !== null
                ? formatUsd(result.totalContributions)
                : "—"
            }
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
            label="Growth on money in"
            value={
              result.valid && result.effectiveYieldPercent !== null
                ? formatPercent(result.effectiveYieldPercent)
                : "—"
            }
          />
          <ResultRow
            label="Compounding periods"
            value={
              result.valid && result.periodCount !== null
                ? result.periodCount.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{result.summary}</p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational estimate, not financial advice. Posted rates, day-count
            conventions, fees, and taxes can differ.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter an initial investment or contribution, an annual rate from 0% to 100%, and years greater than 0."}
          </p>
        )}
      </aside>

      {result.valid && result.schedule.length > 0 ? (
        <div className="rounded-2xl border border-line bg-card p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Year-by-year schedule</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-3 font-medium">Year</th>
                  <th className="py-2 pr-3 font-medium">Beginning balance</th>
                  <th className="py-2 pr-3 font-medium">Contributions</th>
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
                      {formatUsd(row.contributions)}
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
