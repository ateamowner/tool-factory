"use client";

import { useState } from "react";
import { countSigFigs, MAX_SIG_FIGS, roundToSigFigs } from "@/lib/significant-figures";

const MARK_CLASS: Record<string, string> = {
  sig: "text-mint font-semibold",
  leading: "text-muted line-through",
  ambiguous: "text-amber-500 underline decoration-dotted",
  point: "text-text",
  sign: "text-text",
};

export function SignificantFiguresCalculator() {
  const [value, setValue] = useState("0.004560");
  const [figures, setFigures] = useState("2");

  const count = countSigFigs(value);
  const n = Number(figures);
  const figuresValid = /^\d+$/.test(figures.trim());
  const rounded = figuresValid
    ? roundToSigFigs(value, n)
    : ({ valid: false, error: `Enter a whole number from 1 to ${MAX_SIG_FIGS}.` } as const);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="sf-value">
          <span className="mb-2 block text-xs text-muted">Number (decimals, commas, 3.0e8 or 6.02 × 10^23)</span>
          <input
            id="sf-value"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-field font-mono"
          />
        </label>
        <label className="block text-sm" htmlFor="sf-figures">
          <span className="mb-2 block text-xs text-muted">Round to how many significant figures (1–{MAX_SIG_FIGS})</span>
          <input
            id="sf-figures"
            type="number"
            min={1}
            max={MAX_SIG_FIGS}
            step={1}
            value={figures}
            onChange={(e) => setFigures(e.target.value)}
            className="input-field"
          />
        </label>

        {count.valid ? (
          <div className="space-y-2 text-sm">
            <h3 className="text-xs text-muted">Which digits count</h3>
            <p className="break-all font-mono text-2xl tracking-wide" aria-label="Digits marked by significance">
              {count.marks.map((m, i) => (
                <span key={i} className={MARK_CLASS[m.kind]}>
                  {m.char}
                </span>
              ))}
            </p>
            <p className="text-xs text-muted">Green digits are significant, struck-out zeros are placeholders, and dotted zeros are ambiguous.</p>
            <h3 className="pt-2 text-xs text-muted">Counting steps</h3>
            <ol className="list-decimal space-y-2 pl-5 leading-6">
              {count.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {rounded.valid && count.valid ? (
          <div className="space-y-2 text-sm">
            <h3 className="text-xs text-muted">Rounding steps</h3>
            <ol className="list-decimal space-y-2 pl-5 leading-6">
              {rounded.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {count.valid ? (
          <>
            <p className="mt-3 text-xs text-muted">Significant figures</p>
            <p className="font-mono text-3xl font-semibold tabular-nums text-mint">
              {count.ambiguous ? `${count.sigFigs} (up to ${count.maxSigFigs})` : count.sigFigs}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">Scientific notation</dt>
                <dd className="break-all text-right font-mono font-medium">{count.scientific}</dd>
              </div>
              {count.decimalPlaces !== null ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Decimal places</dt>
                  <dd className="text-right font-mono font-medium">{count.decimalPlaces}</dd>
                </div>
              ) : null}
            </dl>
            {rounded.valid ? (
              <>
                <h3 className="mt-5 text-xs text-muted">Rounded to {n} sig fig{n === 1 ? "" : "s"}</h3>
                <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{rounded.standard}</p>
                <dl className="mt-2 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted">Scientific</dt>
                    <dd className="break-all text-right font-mono font-medium">{rounded.scientific}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted">E notation</dt>
                    <dd className="break-all text-right font-mono font-medium">{rounded.eNotation}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted">{rounded.error}</p>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{count.error}</p>
        )}
      </aside>
    </div>
  );
}
