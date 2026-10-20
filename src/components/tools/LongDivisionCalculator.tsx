"use client";

import { useState } from "react";
import { longDivide, MAX_DECIMAL_PLACES } from "@/lib/long-division";

export function LongDivisionCalculator() {
  const [dividend, setDividend] = useState("435");
  const [divisor, setDivisor] = useState("25");
  const [places, setPlaces] = useState("4");
  const result = longDivide(dividend, divisor, places);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm" htmlFor="ld-dividend">
            <span className="mb-2 block text-xs text-muted">Dividend (number being divided)</span>
            <input
              id="ld-dividend"
              value={dividend}
              onChange={(e) => setDividend(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="input-field font-mono"
            />
          </label>
          <label className="block text-sm" htmlFor="ld-divisor">
            <span className="mb-2 block text-xs text-muted">Divisor (divide by)</span>
            <input
              id="ld-divisor"
              value={divisor}
              onChange={(e) => setDivisor(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="input-field font-mono"
            />
          </label>
          <label className="block text-sm" htmlFor="ld-places">
            <span className="mb-2 block text-xs text-muted">Decimal places (0–{MAX_DECIMAL_PLACES})</span>
            <input
              id="ld-places"
              type="number"
              min={0}
              max={MAX_DECIMAL_PLACES}
              value={places}
              onChange={(e) => setPlaces(e.target.value)}
              className="input-field font-mono"
            />
          </label>
        </div>

        {result.valid ? (
          <div className="space-y-3 text-sm">
            <h3 className="text-xs text-muted">Step-by-step work</h3>
            {result.scale !== "1" ? (
              <p className="leading-6">
                Clear the decimals first: multiply both numbers by {result.scale}, so the problem becomes{" "}
                <span className="font-mono">
                  {result.scaledDividend} ÷ {result.scaledDivisor}
                </span>
                .
              </p>
            ) : null}
            {result.negative ? (
              <p className="leading-6">The signs are different, so the answer is negative. Divide the numbers without signs.</p>
            ) : null}
            <ol className="list-decimal space-y-2 pl-5 font-mono tabular-nums leading-7">
              {result.steps.map((s, i) => (
                <li key={i}>
                  {s.phase === "decimal" && (i === 0 || result.steps[i - 1].phase === "integer") ? (
                    <span className="block font-sans text-xs text-muted">Add a decimal point and bring down zeros:</span>
                  ) : null}
                  Bring down {s.broughtDown} → {s.current} ÷ {result.scaledDivisor} = {s.quotientDigit}; {s.quotientDigit} ×{" "}
                  {result.scaledDivisor} = {s.product}; {s.current} − {s.product} = {s.remainder}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-muted">
              {result.dividend} ÷ {result.divisor}
            </p>
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">
              {result.negative && result.quotient !== "0" ? "-" : ""}
              {result.quotient}
              {result.remainder !== "0" ? ` R ${result.remainder}` : ""}
            </p>
            <p className="text-muted">
              Decimal:{" "}
              <span className="font-mono text-text">
                {result.decimal}
                {!result.terminates && result.decimalDigits ? "…" : ""}
              </span>
            </p>
            {result.repeatStart !== null ? (
              <p className="text-muted">
                Repeating decimal: the digits{" "}
                <span className="font-mono text-text">{result.decimalDigits.slice(result.repeatStart)}</span> keep repeating.
              </p>
            ) : null}
            {result.scale !== "1" && result.remainder !== "0" ? (
              <p className="text-xs leading-5 text-muted">
                The remainder is for the scaled problem ({result.scaledDividend} ÷ {result.scaledDivisor}).
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
      </aside>
    </div>
  );
}
