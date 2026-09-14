"use client";

import { useState } from "react";
import {
  DEFAULT_INFLATION_PERCENT,
  computePurchasingPower,
  formatUsd,
  type PurchasingPowerMode,
} from "@/lib/purchasing-power";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: Math.abs(value) >= 0.005 && Math.abs(value) < 1 ? 2 : 0,
    signDisplay: "exceptZero",
  });
  return `${formatted}%`;
}

function yearsLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  const body = abs.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value < 0) return `${body} yr earlier`;
  if (abs === 1) return "1 yr";
  return `${body} yr`;
}

function yearLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function PurchasingPowerCalculator() {
  const [amount, setAmount] = useState("100");
  const [mode, setMode] = useState<PurchasingPowerMode>("rate");
  const [useYearsSpan, setUseYearsSpan] = useState(false);
  const [startYear, setStartYear] = useState("2000");
  const [endYear, setEndYear] = useState("2026");
  const [years, setYears] = useState("26");
  const [inflationPercent, setInflationPercent] = useState(String(DEFAULT_INFLATION_PERCENT));
  const [startCpi, setStartCpi] = useState("172.2");
  const [endCpi, setEndCpi] = useState("322");

  const result = computePurchasingPower({
    amount: parseAmount(amount),
    mode,
    startYear: parseAmount(startYear),
    endYear: parseAmount(endYear),
    years: parseAmount(years),
    useYearsSpan,
    inflationPercent:
      inflationPercent.trim() === "" ? DEFAULT_INFLATION_PERCENT : parseAmount(inflationPercent),
    startCpi: parseAmount(startCpi),
    endCpi: parseAmount(endCpi),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Starting amount (USD)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="input-field"
            placeholder="100"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Comparison method</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "rate", label: "Inflation rate" },
                { id: "cpi", label: "CPI indexes" },
              ] as const
            ).map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="purchasing-power-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Time period</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "endYear", label: "Start & end year" },
                { id: "years", label: "Number of years" },
              ] as const
            ).map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="purchasing-power-period"
                  value={option.id}
                  checked={option.id === "years" ? useYearsSpan : !useYearsSpan}
                  onChange={() => setUseYearsSpan(option.id === "years")}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Start year</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={startYear}
              onChange={(event) => setStartYear(event.target.value)}
              className="input-field"
              placeholder="2000"
            />
          </label>
          {useYearsSpan ? (
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Number of years</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={years}
                onChange={(event) => setYears(event.target.value)}
                className="input-field"
                placeholder="26"
              />
              <span className="mt-2 block text-muted">
                Use a negative span to go backward from the start year.
              </span>
            </label>
          ) : (
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">End year</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={endYear}
                onChange={(event) => setEndYear(event.target.value)}
                className="input-field"
                placeholder="2026"
              />
            </label>
          )}
        </div>

        {mode === "rate" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Average annual inflation (%)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={inflationPercent}
              onChange={(event) => setInflationPercent(event.target.value)}
              className="input-field"
              placeholder="3"
            />
            <span className="mt-2 block text-muted">
              Leave blank to use {DEFAULT_INFLATION_PERCENT}%. Negative values model deflation.
            </span>
          </label>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Start CPI (index)</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={startCpi}
                onChange={(event) => setStartCpi(event.target.value)}
                className="input-field"
                placeholder="172.2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">End CPI (index)</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={endCpi}
                onChange={(event) => setEndCpi(event.target.value)}
                className="input-field"
                placeholder="322"
              />
            </label>
            <span className="sm:col-span-2 text-sm text-muted">
              Example only: U.S. CPI-U was about 172 in 2000 and about 314 in 2024. Enter the
              indexes you want to compare.
            </span>
          </div>
        )}

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Buying power</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label={`Equivalent in ${yearLabel(result.endYear)}`}
            value={result.valid ? formatUsd(result.equivalentAmount ?? Number.NaN) : "—"}
            emphasize
          />
          <ResultRow
            label="Purchasing power change"
            value={percent(result.percentChangePurchasingPower)}
          />
          <ResultRow label="Price level change" value={percent(result.percentChangePrices)} />
          <ResultRow
            label={`Same ${result.valid ? formatUsd(result.amount ?? Number.NaN) : "amount"} buys`}
            value={result.valid ? formatUsd(result.sameNominalBuys ?? Number.NaN) : "—"}
          />
          <ResultRow label="Years" value={yearsLabel(result.years)} />
          {mode === "rate" ? (
            <ResultRow
              label="Inflation rate used"
              value={
                result.inflationPercent === null
                  ? "—"
                  : `${result.inflationPercent.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}%`
              }
            />
          ) : (
            <ResultRow
              label="CPI change"
              value={
                result.startCpi === null || result.endCpi === null
                  ? "—"
                  : `${result.startCpi.toLocaleString(undefined, { maximumFractionDigits: 4 })} → ${result.endCpi.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
              }
            />
          )}
        </dl>

        {result.valid && result.summary ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{result.summary}</p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational estimate, not financial advice. Actual inflation depends on the price
            basket, country, and year. This page does not fetch official CPI series.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter an amount above 0, years from 1800 to 2200 (or a span of at most 200 years),
            an inflation rate from −50% to 100%, or CPI indexes above 0.
          </p>
        )}
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
