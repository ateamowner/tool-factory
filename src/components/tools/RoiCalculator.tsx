"use client";

import { useState } from "react";
import {
  computeRoi,
  formatPercent,
  formatUsd,
  type RoiMode,
} from "@/lib/roi";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

const MODE_OPTIONS: { id: RoiMode; label: string; hint: string }[] = [
  {
    id: "cost_final",
    label: "Cost + final value",
    hint: "Solve ROI % and net profit from what you put in and what it is worth now.",
  },
  {
    id: "cost_gain",
    label: "Cost + net profit",
    hint: "Solve ROI % and final value from the initial investment and gain (or loss).",
  },
];

export function RoiCalculator() {
  const [mode, setMode] = useState<RoiMode>("cost_final");
  const [initialInvestment, setInitialInvestment] = useState("1000");
  const [finalValue, setFinalValue] = useState("1500");
  const [netProfit, setNetProfit] = useState("500");

  const result = computeRoi({
    mode,
    initialInvestment: parseAmount(initialInvestment),
    finalValue: parseAmount(finalValue),
    netProfit: parseAmount(netProfit),
  });

  const activeMode = MODE_OPTIONS.find((option) => option.id === mode);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Calculation mode</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="roi-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{activeMode?.hint}</p>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Initial investment</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={initialInvestment}
            onChange={(event) => setInitialInvestment(event.target.value)}
            className="input-field"
            placeholder="1000"
          />
          <span className="mt-2 block text-muted">
            Cost or amount you put in. Must be greater than 0 — ROI divides by
            this number.
          </span>
        </label>

        {mode === "cost_final" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Final value</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={finalValue}
              onChange={(event) => setFinalValue(event.target.value)}
              className="input-field"
              placeholder="1500"
            />
            <span className="mt-2 block text-muted">
              Current or ending value of the investment. $0 is a total loss
              (−100% ROI).
            </span>
          </label>
        ) : null}

        {mode === "cost_gain" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Net profit (gain)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={netProfit}
              onChange={(event) => setNetProfit(event.target.value)}
              className="input-field"
              placeholder="500"
            />
            <span className="mt-2 block text-muted">
              Profit in dollars. Use a negative number for a loss. Cannot leave a
              negative final value.
            </span>
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
        <h2 className="text-lg font-semibold">ROI results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="ROI %"
            value={
              result.valid && result.roiPercent !== null
                ? formatPercent(result.roiPercent)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Net profit"
            value={
              result.valid && result.netProfit !== null
                ? formatUsd(result.netProfit)
                : "—"
            }
          />
          <ResultRow
            label="Final value"
            value={
              result.valid && result.finalValue !== null
                ? formatUsd(result.finalValue)
                : "—"
            }
          />
          <ResultRow
            label="Initial investment"
            value={
              result.valid && result.initialInvestment !== null
                ? formatUsd(result.initialInvestment)
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {formatUsd(result.initialInvestment ?? 0)} invested and{" "}
            {formatUsd(result.finalValue ?? 0)} final value leave{" "}
            {formatUsd(result.netProfit ?? 0)} net profit
            {result.roiPercent !== null
              ? ` — ${formatPercent(result.roiPercent)} ROI.`
              : "."}
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            ROI % = ((final − initial) / initial) × 100. Educational estimate,
            not investment advice.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter an initial investment greater than 0 and a final value or net profit."}
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
