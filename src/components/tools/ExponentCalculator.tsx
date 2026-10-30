"use client";

import { useState } from "react";
import { power, solveBase, solveExponent, type ExponentMode } from "@/lib/exponent";

const MODES: { mode: ExponentMode; label: string }[] = [
  { mode: "power", label: "Find the answer (bⁿ)" },
  { mode: "base", label: "Solve for the base" },
  { mode: "exponent", label: "Solve for the exponent" },
];

export function ExponentCalculator() {
  const [mode, setMode] = useState<ExponentMode>("power");
  const [base, setBase] = useState("2");
  const [exp, setExp] = useState("10");
  const [answer, setAnswer] = useState("1024");

  const result =
    mode === "power" ? power(base, exp) : mode === "base" ? solveBase(answer, exp) : solveExponent(base, answer);

  const field = (id: string, label: string, value: string, set: (v: string) => void) => (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="input-field"
      />
    </label>
  );

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

        <div className="grid gap-4 sm:grid-cols-2">
          {mode !== "base" ? field("exp-base", "Base (b)", base, setBase) : null}
          {mode !== "exponent" ? field("exp-exponent", "Exponent (n): 3, −2, 0.5 or 2/3", exp, setExp) : null}
          {mode !== "power" ? field("exp-answer", "Result (bⁿ)", answer, setAnswer) : null}
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
            <p className="mt-3 text-xs text-muted">
              {mode === "power" ? "Answer" : mode === "base" ? "Base (x)" : "Exponent (x)"}
            </p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{result.answer}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Scientific notation" value={result.scientific} />
              <Row label="E notation" value={result.eNotation} />
              {result.standard ? <Row label="Standard form" value={result.standard} /> : null}
            </dl>
            {result.note ? <p className="mt-4 text-sm leading-6 text-muted">{result.note}</p> : null}
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
