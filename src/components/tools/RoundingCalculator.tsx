"use client";

import { useState } from "react";
import { compareModes, MAX_DECIMALS, MODE_LABELS, roundNumber, type RoundingMode } from "@/lib/rounding";

const MODES = Object.keys(MODE_LABELS) as RoundingMode[];

const PLACES: { value: string; label: string }[] = [
  { value: "decimals", label: "Decimal places" },
  { value: "0", label: "Nearest whole number" },
  { value: "-1", label: "Nearest 10" },
  { value: "-2", label: "Nearest 100" },
  { value: "-3", label: "Nearest 1,000" },
];

export function RoundingCalculator() {
  const [value, setValue] = useState("3.14159");
  const [target, setTarget] = useState("decimals");
  const [decimals, setDecimals] = useState("2");
  const [mode, setMode] = useState<RoundingMode>("half-up");

  const place = target === "decimals" ? Number(decimals) : Number(target);
  const decimalsValid = target !== "decimals" || /^\d+$/.test(decimals.trim());
  const result = decimalsValid
    ? roundNumber(value, place, mode)
    : ({ valid: false, error: `Enter a whole number of decimal places from 0 to ${MAX_DECIMALS}.` } as const);
  const comparison = result.valid ? compareModes(value, place) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="round-value">
          <span className="mb-2 block text-xs text-muted">Number to round</span>
          <input
            id="round-value"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-field"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm" htmlFor="round-target">
            <span className="mb-2 block text-xs text-muted">Round to</span>
            <select id="round-target" value={target} onChange={(e) => setTarget(e.target.value)} className="input-field">
              {PLACES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          {target === "decimals" ? (
            <label className="block text-sm" htmlFor="round-decimals">
              <span className="mb-2 block text-xs text-muted">Decimal places (0–{MAX_DECIMALS})</span>
              <input
                id="round-decimals"
                type="number"
                min={0}
                max={MAX_DECIMALS}
                step={1}
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="input-field"
              />
            </label>
          ) : null}
        </div>

        <fieldset className="flex flex-wrap gap-2" aria-label="Rounding mode">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`chip inline-flex ${mode === m ? "border-mint text-mint" : ""}`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </fieldset>

        {result.valid ? (
          <div className="space-y-2 text-sm">
            <h3 className="text-xs text-muted">Step by step</h3>
            <ol className="list-decimal space-y-2 pl-5 leading-6">
              {result.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <>
            <p className="mt-3 text-xs text-muted">Rounded ({MODE_LABELS[mode].toLowerCase()})</p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{result.formatted}</p>
            <h3 className="mt-5 text-xs text-muted">Every mode</h3>
            <dl className="mt-2 space-y-3 text-sm">
              {comparison.map((c) => (
                <div key={c.mode} className="flex items-start justify-between gap-4">
                  <dt className="text-muted">{c.label}</dt>
                  <dd className="break-all text-right font-mono font-medium tabular-nums">{c.answer}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
      </aside>
    </div>
  );
}
