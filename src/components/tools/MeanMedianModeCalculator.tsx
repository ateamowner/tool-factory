"use client";

import { useState } from "react";
import { computeMeanMedianMode } from "@/lib/mean-median-mode";
import { formatStatNumber } from "@/lib/standard-deviation";

export function MeanMedianModeCalculator() {
  const [input, setInput] = useState("3, 7, 7, 2, 9, 4, 7, 1");
  const result = computeMeanMedianMode(input);
  const f = formatStatNumber;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="mmm-input">
          <span className="mb-2 block text-xs text-muted">Numbers (separate with commas, spaces, or new lines)</span>
          <textarea
            id="mmm-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            inputMode="decimal"
            className="input-field min-h-[8rem] resize-y font-mono text-sm"
            placeholder={"e.g. 3, 7, 7, 2, 9, 4, 7, 1"}
          />
        </label>
        <p className="text-sm leading-6 text-muted">
          Mean = sum / count. Median = middle value of the sorted list. Mode = most frequent value. Range = max − min.
        </p>
        {result.valid ? (
          <div className="space-y-3 text-sm">
            <h3 className="text-xs text-muted">Step-by-step work</h3>
            <ol className="list-decimal space-y-2 pl-5 font-mono tabular-nums leading-7">
              <li>
                Sorted: {result.sorted.slice(0, 60).map(f).join(", ")}
                {result.count > 60 ? ` … (${result.count - 60} more)` : ""}
              </li>
              <li>
                Mean: {f(result.sum)} / {result.count} = {f(result.mean)}
              </li>
              <li>
                Median: {result.count % 2 === 1 ? "middle value" : "average of the two middle values"} = {f(result.median)}
              </li>
              <li>
                Mode:{" "}
                {result.modes.length === 0
                  ? "no value repeats, so there is no mode"
                  : `${result.modes.map(f).join(", ")} (each appears ${result.modeCount} times)`}
              </li>
              <li>
                Range: {f(result.max)} − {f(result.min)} = {f(result.range)}
              </li>
            </ol>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Mean" value={f(result.mean)} emphasize />
            <Row label="Median" value={f(result.median)} emphasize />
            <Row label={result.modes.length > 1 ? "Modes" : "Mode"} value={result.modes.length === 0 ? "None" : result.modes.map(f).join(", ")} emphasize />
            <Row label="Range" value={f(result.range)} emphasize />
            <Row label="Count" value={String(result.count)} />
            <Row label="Sum" value={f(result.sum)} />
            <Row label="Minimum" value={f(result.min)} />
            <Row label="Maximum" value={f(result.max)} />
            <Row label="Midrange" value={f(result.midrange)} />
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
