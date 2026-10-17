"use client";

import { useState } from "react";
import { computeStandardDeviation, formatStatNumber } from "@/lib/standard-deviation";

const MAX_STEP_ROWS = 50;

export function StandardDeviationCalculator() {
  const [input, setInput] = useState("2, 4, 4, 4, 5, 5, 7, 9");
  const result = computeStandardDeviation(input);
  const f = formatStatNumber;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="sd-input">
          <span className="mb-2 block text-xs text-muted">Numbers (separate with commas, spaces, or new lines)</span>
          <textarea
            id="sd-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            inputMode="decimal"
            className="input-field min-h-[8rem] resize-y font-mono text-sm"
            placeholder={"e.g. 2, 4, 4, 4, 5, 5, 7, 9"}
          />
        </label>
        <p className="text-sm leading-6 text-muted">
          Population σ = √(Σ(x − μ)² / N). Sample s = √(Σ(x − x̄)² / (n − 1)).
        </p>
        {result.valid ? (
          <div className="space-y-3 text-sm">
            <h3 className="text-xs text-muted">Step-by-step work</h3>
            <ol className="list-decimal space-y-2 pl-5 font-mono tabular-nums leading-7">
              <li>
                Count: n = {result.count}
              </li>
              <li>
                Sum: Σx = {f(result.sum)}
              </li>
              <li>
                Mean: x̄ = {f(result.sum)} / {result.count} = {f(result.mean)}
              </li>
              <li>
                Squared deviations (x − x̄)²:
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted">
                        <th className="pr-4 font-normal">x</th>
                        <th className="pr-4 font-normal">x − x̄</th>
                        <th className="font-normal">(x − x̄)²</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.values.slice(0, MAX_STEP_ROWS).map((v, i) => (
                        <tr key={i}>
                          <td className="pr-4">{f(v)}</td>
                          <td className="pr-4">{f(v - result.mean)}</td>
                          <td>{f(result.squaredDeviations[i])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.count > MAX_STEP_ROWS ? (
                    <p className="mt-1 text-xs text-muted">Showing the first {MAX_STEP_ROWS} of {result.count} values.</p>
                  ) : null}
                </div>
              </li>
              <li>
                Sum of squares: Σ(x − x̄)² = {f(result.sumSquares)}
              </li>
              <li>
                Population variance: σ² = {f(result.sumSquares)} / {result.count} = {f(result.populationVariance)}
              </li>
              <li>
                Population std dev: σ = √{f(result.populationVariance)} = {f(result.populationStdDev)}
              </li>
              {result.sampleVariance !== null && result.sampleStdDev !== null ? (
                <>
                  <li>
                    Sample variance: s² = {f(result.sumSquares)} / {result.count - 1} = {f(result.sampleVariance)}
                  </li>
                  <li>
                    Sample std dev: s = √{f(result.sampleVariance)} = {f(result.sampleStdDev)}
                  </li>
                </>
              ) : (
                <li>Sample variance needs at least two values (n − 1 would be 0).</li>
              )}
            </ol>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row
              label="Sample std dev (s)"
              value={result.sampleStdDev === null ? "— (need 2+ values)" : f(result.sampleStdDev)}
              emphasize
            />
            <Row label="Population std dev (σ)" value={f(result.populationStdDev)} emphasize />
            <Row label="Count (n)" value={String(result.count)} />
            <Row label="Sum" value={f(result.sum)} />
            <Row label="Mean" value={f(result.mean)} />
            <Row
              label="Sample variance (s²)"
              value={result.sampleVariance === null ? "—" : f(result.sampleVariance)}
            />
            <Row label="Population variance (σ²)" value={f(result.populationVariance)} />
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
