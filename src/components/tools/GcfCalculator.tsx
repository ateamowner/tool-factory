"use client";

import { useState } from "react";
import { computeGcf, formatFactorization, parseIntegerList } from "@/lib/gcf";

export function GcfCalculator() {
  const [input, setInput] = useState("24, 36, 60");
  const parsed = parseIntegerList(input);
  const result = parsed ? computeGcf(parsed) : ({ valid: false, error: "Use numbers only, separated by commas or spaces." } as const);
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="gcf-numbers">
          <span className="mb-2 block text-xs text-muted">Whole numbers (2 to 20, separated by commas or spaces)</span>
          <input
            id="gcf-numbers"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-field"
            placeholder="12, 18"
          />
        </label>
        <p className="text-sm leading-6 text-muted">
          The greatest common factor (GCF), also called the greatest common divisor (GCD) or highest common factor (HCF), is the largest whole number that divides every number in the list.
        </p>
        {result.valid ? (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-xs text-muted">Prime factorization</h3>
              <ul className="mt-2 space-y-1 font-mono tabular-nums">
                {result.factorizations.map((f, i) => (
                  <li key={`${f.n}-${i}`}>
                    {fmt(f.n)} = {f.n < 2 ? fmt(f.n) : formatFactorization(f.primes)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs text-muted">Euclidean algorithm steps</h3>
              <ol className="mt-2 max-h-56 space-y-1 overflow-auto font-mono tabular-nums">
                {result.steps.slice(0, 40).map((s, i) => (
                  <li key={i}>
                    {fmt(s.a)} = {fmt(s.q)} × {fmt(s.b)} + {fmt(s.r)}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="GCF" value={fmt(result.gcf)} emphasize />
            <Row label="LCM" value={result.lcm ? fmt(result.lcm) : "0"} />
            <Row label="Relatively prime?" value={result.coprime ? "Yes" : "No"} />
            <Row
              label="Common factors"
              value={
                result.commonFactors.length > 24
                  ? `${result.commonFactors.slice(0, 24).map(fmt).join(", ")} … (${result.commonFactors.length})`
                  : result.commonFactors.map(fmt).join(", ")
              }
            />
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
