"use client";

import { useState } from "react";
import { iqr, type QuartileMethod } from "@/lib/iqr";

const METHODS: { method: QuartileMethod; label: string }[] = [
  { method: "exclusive", label: "Exclusive (n + 1)" },
  { method: "inclusive", label: "Inclusive (n − 1)" },
];

export function IqrCalculator() {
  const [text, setText] = useState("1, 3, 5, 7, 8, 9, 12, 14, 15, 18, 45");
  const [method, setMethod] = useState<QuartileMethod>("exclusive");

  const result = iqr(text, method);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="iqr-data">
          <span className="mb-2 block text-xs text-muted">Numbers (separate with commas, spaces or new lines)</span>
          <textarea
            id="iqr-data"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-field font-mono"
          />
        </label>
        <fieldset className="flex flex-wrap gap-2" aria-label="Quartile method">
          {METHODS.map((m) => (
            <button
              key={m.method}
              type="button"
              aria-pressed={method === m.method}
              onClick={() => setMethod(m.method)}
              className={`chip inline-flex ${method === m.method ? "border-mint text-mint" : ""}`}
            >
              {m.label}
            </button>
          ))}
        </fieldset>
        <p className="text-xs leading-5 text-muted">
          Exclusive matches Excel QUARTILE.EXC and most statistics textbooks. Inclusive matches Excel QUARTILE.INC and QUARTILE.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <>
            <p className="mt-3 text-xs text-muted">Interquartile range (IQR = Q3 − Q1)</p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{result.iqr}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Count" value={String(result.count)} />
              <Row label="Minimum" value={String(result.min)} />
              <Row label="Q1 (25th percentile)" value={String(result.q1)} />
              <Row label="Q2 (median)" value={String(result.median)} />
              <Row label="Q3 (75th percentile)" value={String(result.q3)} />
              <Row label="Maximum" value={String(result.max)} />
              <Row label="Lower fence" value={String(result.lowerFence)} />
              <Row label="Upper fence" value={String(result.upperFence)} />
              <Row label="Outliers" value={result.outliers.length ? result.outliers.join(", ") : "None"} />
            </dl>
            <p className="mt-4 text-sm leading-6 text-muted">
              Five-number summary: {result.min}, {result.q1}, {result.median}, {result.q3}, {result.max}.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-mono font-medium tabular-nums">{value}</dd>
    </div>
  );
}
