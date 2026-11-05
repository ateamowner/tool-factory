"use client";

import { useState } from "react";
import {
  computeRuleOf72,
  formatPercent,
  formatYears,
  type RuleOf72Mode,
} from "@/lib/rule-of-72";

const MODE_OPTIONS: { id: RuleOf72Mode; label: string }[] = [
  { id: "years-from-rate", label: "Years to double" },
  { id: "rate-from-years", label: "Rate to double" },
];

function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,%]/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function RuleOf72Calculator() {
  const [mode, setMode] = useState<RuleOf72Mode>("years-from-rate");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");

  const result = computeRuleOf72({
    mode,
    ratePercent: parseAmount(rate),
    years: parseAmount(years),
  });

  const formatValue = (n: number) =>
    result.valid && result.unit === "years" ? formatYears(n) : formatPercent(n);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Calculate</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="rule72-mode"
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

        {mode === "years-from-rate" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Annual rate % (r)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              className="input-field"
              placeholder="8"
            />
            <span className="mt-2 block text-muted">
              Yearly return, e.g. 8 for 8% per year. Years to double ≈ 72 ÷ rate.
            </span>
          </label>
        ) : (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Years to double (t)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              className="input-field"
              placeholder="10"
            />
            <span className="mt-2 block text-muted">
              How many years until the money doubles. Rate ≈ 72 ÷ years.
            </span>
          </label>
        )}

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">
          {mode === "years-from-rate" ? "Years to double" : "Rate to double"}
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Rule of 72"
            value={result.valid ? formatValue(result.estimates.rule72) : "—"}
            emphasize
          />
          <ResultRow
            label="Exact compound"
            value={result.valid ? formatValue(result.estimates.exact) : "—"}
          />
          <ResultRow
            label="Rule of 70"
            value={result.valid ? formatValue(result.estimates.rule70) : "—"}
          />
          <ResultRow
            label="Rule of 69.3"
            value={result.valid ? formatValue(result.estimates.rule693) : "—"}
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {mode === "years-from-rate" ? (
              <>
                At {result.ratePercent}% a year, the Rule of 72 says money doubles in about{" "}
                {formatYears(result.estimates.rule72)}. Exact compound interest takes{" "}
                {formatYears(result.estimates.exact)}.
              </>
            ) : (
              <>
                To double in {result.years} years, the Rule of 72 says you need about{" "}
                {formatPercent(result.estimates.rule72)}. Exact compound interest needs{" "}
                {formatPercent(result.estimates.exact)}.
              </>
            )}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ?? "Enter a rate or a number of years."}
          </p>
        )}
        <p className="mt-4 text-sm leading-6 text-muted">
          Exact years = ln(2) ÷ ln(1 + r). Exact rate = 2^(1/t) − 1. Educational estimate, not
          financial advice.
        </p>
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
      <dd className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
