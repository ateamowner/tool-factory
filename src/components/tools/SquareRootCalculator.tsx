"use client";

import { useState } from "react";
import { computeRoot, type RootMode } from "@/lib/squareRoot";

export function SquareRootCalculator() {
  const [value, setValue] = useState("72");
  const [mode, setMode] = useState<RootMode>("square");
  const result = computeRoot(value, mode);
  const symbol = mode === "square" ? "√" : "∛";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex flex-wrap gap-2" aria-label="Root type">
          {(["square", "cube"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`chip inline-flex ${mode === m ? "border-mint text-mint" : ""}`}
            >
              {m === "square" ? "Square root (√)" : "Cube root (∛)"}
            </button>
          ))}
        </fieldset>
        <label className="block text-sm" htmlFor="root-input">
          <span className="mb-2 block text-xs text-muted">Number</span>
          <input
            id="root-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-field"
          />
        </label>
        {result.valid ? (
          <div className="space-y-2 text-sm">
            <h3 className="text-xs text-muted">Step by step</h3>
            <ol className="list-decimal space-y-2 pl-5 font-mono leading-6">
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
          <dl className="mt-4 space-y-3 text-sm">
            <Row label={`${symbol}${value.trim()}`} value={result.decimalText} emphasize />
            <Row label="Simplified radical" value={result.radicalText ?? "Whole numbers only"} />
            <Row
              label={mode === "square" ? "Perfect square?" : "Perfect cube?"}
              value={result.radicalText === null ? "—" : result.perfect ? "Yes" : "No"}
            />
            {mode === "square" ? (
              <Row label="Answer type" value={result.imaginary ? "Imaginary (negative input)" : "Real"} />
            ) : (
              <Row label="Answer type" value="Real" />
            )}
          </dl>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}>{value}</dd>
    </div>
  );
}
