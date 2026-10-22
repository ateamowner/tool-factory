"use client";

import { useState } from "react";
import { computeLcm, formatFactorization, formatHighestPowers, parseIntegerList } from "@/lib/lcm";

export function LcmCalculator() {
  const [input, setInput] = useState("4, 6, 10");
  const parsed = parseIntegerList(input);
  const result = parsed ? computeLcm(parsed) : ({ valid: false, error: "Use numbers only, separated by commas or spaces." } as const);
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="lcm-numbers">
          <span className="mb-2 block text-xs text-muted">Whole numbers (2 to 20, separated by commas or spaces)</span>
          <input
            id="lcm-numbers"
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
          The least common multiple (LCM), also called the lowest common multiple or least common denominator when working with fractions, is the smallest positive number that every number in the list divides into evenly.
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
              <p className="mt-2 font-mono tabular-nums">
                LCM = {result.highestPowers.length ? formatHighestPowers(result.highestPowers) : "1"} = {fmt(result.lcm)}
              </p>
              <p className="mt-1 text-xs text-muted">Take each prime at its highest power in any of the numbers, then multiply.</p>
            </div>
            <div>
              <h3 className="text-xs text-muted">GCF method steps</h3>
              <ol className="mt-2 max-h-56 space-y-1 overflow-auto font-mono tabular-nums">
                {result.steps.map((s, i) => (
                  <li key={i}>
                    LCM({fmt(s.a)}, {fmt(s.b)}) = {fmt(s.a)} × {fmt(s.b)} ÷ {fmt(s.gcf)} = {fmt(s.lcm)}
                  </li>
                ))}
              </ol>
            </div>
            {result.multiples.length ? (
              <div>
                <h3 className="text-xs text-muted">Listing multiples</h3>
                <ul className="mt-2 space-y-1 font-mono tabular-nums">
                  {result.multiples.map((m, i) => (
                    <li key={`${m.n}-${i}`}>
                      {fmt(m.n)}: {m.list.map(fmt).join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="LCM" value={fmt(result.lcm)} emphasize />
            <Row label="GCF" value={fmt(result.gcf)} />
            <Row label="Numbers" value={result.numbers.map(fmt).join(", ")} />
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
