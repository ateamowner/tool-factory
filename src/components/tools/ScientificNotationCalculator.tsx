"use client";

import { useState } from "react";
import { convertNumber, operate, type SciOp } from "@/lib/scientificNotation";

type Mode = "convert" | "math";

const OPS: { op: SciOp; label: string }[] = [
  { op: "add", label: "+" },
  { op: "subtract", label: "−" },
  { op: "multiply", label: "×" },
  { op: "divide", label: "÷" },
];

export function ScientificNotationCalculator() {
  const [mode, setMode] = useState<Mode>("convert");
  const [value, setValue] = useState("123000");
  const [sigFigs, setSigFigs] = useState("auto");
  const [a, setA] = useState("3.2 x 10^4");
  const [b, setB] = useState("1.5e3");
  const [op, setOp] = useState<SciOp>("multiply");

  const sig = sigFigs === "auto" ? undefined : Number(sigFigs);
  const result = mode === "convert" ? convertNumber(value, sig) : operate(a, b, op);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex flex-wrap gap-2" aria-label="Calculator mode">
          {(["convert", "math"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`chip inline-flex ${mode === m ? "border-mint text-mint" : ""}`}
            >
              {m === "convert" ? "Convert a number" : "Add, subtract, multiply, divide"}
            </button>
          ))}
        </fieldset>

        {mode === "convert" ? (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <label className="block text-sm" htmlFor="sci-input">
              <span className="mb-2 block text-xs text-muted">Number (standard, 1.23e5, or 1.23 x 10^5)</span>
              <input
                id="sci-input"
                type="text"
                inputMode="text"
                autoComplete="off"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input-field"
              />
            </label>
            <label className="block text-sm" htmlFor="sci-sigfigs">
              <span className="mb-2 block text-xs text-muted">Significant figures</span>
              <select id="sci-sigfigs" value={sigFigs} onChange={(e) => setSigFigs(e.target.value)} className="input-field">
                <option value="auto">Auto</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
            <label className="block text-sm" htmlFor="sci-a">
              <span className="mb-2 block text-xs text-muted">First number</span>
              <input id="sci-a" type="text" autoComplete="off" value={a} onChange={(e) => setA(e.target.value)} className="input-field" />
            </label>
            <fieldset className="flex gap-1" aria-label="Operation">
              {OPS.map((o) => (
                <button
                  key={o.op}
                  type="button"
                  aria-pressed={op === o.op}
                  aria-label={o.op}
                  onClick={() => setOp(o.op)}
                  className={`chip inline-flex font-mono ${op === o.op ? "border-mint text-mint" : ""}`}
                >
                  {o.label}
                </button>
              ))}
            </fieldset>
            <label className="block text-sm" htmlFor="sci-b">
              <span className="mb-2 block text-xs text-muted">Second number</span>
              <input id="sci-b" type="text" autoComplete="off" value={b} onChange={(e) => setB(e.target.value)} className="input-field" />
            </label>
          </div>
        )}

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
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Scientific notation" value={result.scientific} emphasize />
            <Row label="E notation" value={result.eNotation} />
            <Row label="Standard form" value={result.standard} />
            <Row label="Engineering notation" value={result.engineering} />
            <Row label="Coefficient" value={String(result.coefficient).replace("-", "−")} />
            <Row label="Exponent" value={String(result.exponent).replace("-", "−")} />
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
      <dd className={`break-all text-right font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}>{value}</dd>
    </div>
  );
}
