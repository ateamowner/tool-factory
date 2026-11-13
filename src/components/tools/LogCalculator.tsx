"use client";

import { useState } from "react";
import { antilog, logarithm, type LogMode } from "@/lib/log";

const MODES: { mode: LogMode; label: string }[] = [
  { mode: "log", label: "Logarithm (log_b x)" },
  { mode: "antilog", label: "Antilog (b^y)" },
];

const BASES = [
  { value: "10", label: "Base 10 (log)" },
  { value: "e", label: "Base e (ln)" },
  { value: "2", label: "Base 2" },
];

export function LogCalculator() {
  const [mode, setMode] = useState<LogMode>("log");
  const [base, setBase] = useState("10");
  const [num, setNum] = useState("1000");

  const result = mode === "log" ? logarithm(num, base) : antilog(num, base);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex flex-wrap gap-2" aria-label="Calculator mode">
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              aria-pressed={mode === m.mode}
              onClick={() => setMode(m.mode)}
              className={`chip inline-flex ${mode === m.mode ? "border-mint text-mint" : ""}`}
            >
              {m.label}
            </button>
          ))}
        </fieldset>

        <fieldset className="flex flex-wrap gap-2" aria-label="Base presets">
          {BASES.map((b) => (
            <button
              key={b.value}
              type="button"
              aria-pressed={base.trim().toLowerCase() === b.value}
              onClick={() => setBase(b.value)}
              className={`chip inline-flex ${base.trim().toLowerCase() === b.value ? "border-mint text-mint" : ""}`}
            >
              {b.label}
            </button>
          ))}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm" htmlFor="log-number">
            <span className="mb-2 block text-xs text-muted">
              {mode === "log" ? "Number (x), must be positive" : "Log value (y): 3, −2 or 0.5"}
            </span>
            <input
              id="log-number"
              type="text"
              inputMode="text"
              autoComplete="off"
              value={num}
              onChange={(e) => setNum(e.target.value)}
              className="input-field"
            />
          </label>
          <label className="block text-sm" htmlFor="log-base">
            <span className="mb-2 block text-xs text-muted">Base (b): any positive number except 1, or e</span>
            <input
              id="log-base"
              type="text"
              inputMode="text"
              autoComplete="off"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="input-field"
            />
          </label>
        </div>

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
          <>
            <p className="mt-3 text-xs text-muted">{mode === "log" ? "Logarithm" : "Antilog"}</p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{result.answer}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Scientific notation" value={result.scientific} />
              <Row label={mode === "log" ? "ln of the number" : "ln of the answer"} value={result.ln} />
              <Row label={mode === "log" ? "log₁₀ of the number" : "log₁₀ of the answer"} value={result.log10} />
            </dl>
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
      <dd className="break-all text-right font-mono font-medium tabular-nums">{value}</dd>
    </div>
  );
}
