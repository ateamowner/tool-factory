"use client";

import { useState } from "react";
import { computeSimpleInterest, formatUsd, type TermUnit } from "@/lib/simple-interest";

function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,%]/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

const UNIT_OPTIONS: { id: TermUnit; label: string }[] = [
  { id: "days", label: "Days" },
  { id: "months", label: "Months" },
  { id: "years", label: "Years" },
];

function formatYears(years: number): string {
  const rounded = Math.round(years * 10000) / 10000;
  return `${rounded.toLocaleString("en-US", { maximumFractionDigits: 4 })} yr`;
}

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5");
  const [term, setTerm] = useState("3");
  const [unit, setUnit] = useState<TermUnit>("years");
  const [dayBasis, setDayBasis] = useState<365 | 360>(365);

  const result = computeSimpleInterest({
    principal: parseAmount(principal),
    ratePercent: parseAmount(rate),
    term: parseAmount(term),
    termUnit: unit,
    dayBasis,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Principal (P)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
            className="input-field"
            placeholder="10000"
          />
          <span className="mt-2 block text-muted">The amount borrowed or invested.</span>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Annual interest rate % (r)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="input-field"
            placeholder="5"
          />
          <span className="mt-2 block text-muted">Yearly rate, e.g. 5 for 5% per year.</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Term (t)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              className="input-field"
              placeholder="3"
            />
          </label>
          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Term unit</legend>
            <div className="grid grid-cols-3 gap-2">
              {UNIT_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="term-unit"
                    value={option.id}
                    checked={unit === option.id}
                    onChange={() => setUnit(option.id)}
                    className="accent-mint"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {unit === "days" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Days per year</span>
            <select
              value={dayBasis}
              onChange={(event) => setDayBasis(event.target.value === "360" ? 360 : 365)}
              className="input-field"
            >
              <option value={365}>365 (exact)</option>
              <option value={360}>360 (banker&apos;s year)</option>
            </select>
          </label>
        ) : null}

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Simple interest results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Interest (I)"
            value={result.valid && result.interest !== null ? formatUsd(result.interest) : "—"}
            emphasize
          />
          <ResultRow
            label="Total amount (P + I)"
            value={
              result.valid && result.totalAmount !== null ? formatUsd(result.totalAmount) : "—"
            }
          />
          <ResultRow
            label="Term in years"
            value={result.valid && result.years !== null ? formatYears(result.years) : "—"}
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {formatUsd(result.principal ?? 0)} at {result.ratePercent}% a year for{" "}
            {formatYears(result.years ?? 0)} earns {formatUsd(result.interest ?? 0)} in simple
            interest, for a total of {formatUsd(result.totalAmount ?? 0)}.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ?? "Enter a principal, rate, and term."}
          </p>
        )}
        <p className="mt-4 text-sm leading-6 text-muted">
          I = P × r × t. Educational estimate, not financial advice.
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
      <dd
        className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
