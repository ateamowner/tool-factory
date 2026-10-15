"use client";

import { useState } from "react";
import { computeFactoring } from "@/lib/factoring";

function kindLabel(kind: "one" | "prime" | "composite"): string {
  if (kind === "one") return "Neither (1)";
  if (kind === "prime") return "Prime";
  return "Composite";
}

export function FactoringCalculator() {
  const [input, setInput] = useState("360");
  const result = computeFactoring(input.trim() === "" ? "" : input);
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="factoring-number">
          <span className="mb-2 block text-xs text-muted">Positive whole number (up to 1,000,000,000,000)</span>
          <input
            id="factoring-number"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-field"
            placeholder="360"
          />
        </label>
        <p className="text-sm leading-6 text-muted">
          Factoring breaks a whole number into a product of primes and lists every positive factor that divides it evenly.
        </p>
        {result.valid ? (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-xs text-muted">Prime factorization</h3>
              <p className="mt-2 font-mono tabular-nums">
                {fmt(result.n)} = {result.factorization}
              </p>
            </div>
            <div>
              <h3 className="text-xs text-muted">All positive factors ({result.factorCount})</h3>
              <p className="mt-2 max-h-56 overflow-auto font-mono tabular-nums leading-7">
                {result.factors.length > 48
                  ? `${result.factors.slice(0, 48).map(fmt).join(", ")} …`
                  : result.factors.map(fmt).join(", ")}
              </p>
            </div>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Prime factorization" value={result.factorization} emphasize />
            <Row label="Factor count" value={fmt(result.factorCount)} />
            <Row label="Prime or composite?" value={kindLabel(result.kind)} />
            <Row
              label="Factors"
              value={
                result.factors.length > 16
                  ? `${result.factors.slice(0, 16).map(fmt).join(", ")} … (${result.factorCount})`
                  : result.factors.map(fmt).join(", ")
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
