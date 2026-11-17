"use client";

import { useState } from "react";
import { fromPointSlope, fromSlopeIntercept, numberToStandardForm } from "@/lib/standard-form";

type Mode = "slope-intercept" | "point-slope" | "number";

const MODES: { mode: Mode; label: string }[] = [
  { mode: "slope-intercept", label: "From y = mx + b" },
  { mode: "point-slope", label: "From point-slope" },
  { mode: "number", label: "Number to a × 10ⁿ" },
];

export function StandardFormCalculator() {
  const [mode, setMode] = useState<Mode>("slope-intercept");
  const [m, setM] = useState("2/3");
  const [b, setB] = useState("4");
  const [x1, setX1] = useState("3");
  const [y1, setY1] = useState("5");
  const [num, setNum] = useState("45000");

  const line = mode === "slope-intercept" ? fromSlopeIntercept(m, b) : mode === "point-slope" ? fromPointSlope(m, x1, y1) : null;
  const sci = mode === "number" ? numberToStandardForm(num) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex flex-wrap gap-2" aria-label="Conversion type">
          {MODES.map((o) => (
            <button
              key={o.mode}
              type="button"
              aria-pressed={mode === o.mode}
              onClick={() => setMode(o.mode)}
              className={`chip inline-flex ${mode === o.mode ? "border-mint text-mint" : ""}`}
            >
              {o.label}
            </button>
          ))}
        </fieldset>
        {mode !== "number" && (
          <div className="grid grid-cols-2 gap-4">
            <Field id="sf-m" label="Slope m" value={m} onChange={setM} />
            {mode === "slope-intercept" ? (
              <Field id="sf-b" label="y-intercept b" value={b} onChange={setB} />
            ) : (
              <>
                <Field id="sf-x1" label="Point x₁" value={x1} onChange={setX1} />
                <Field id="sf-y1" label="Point y₁" value={y1} onChange={setY1} />
              </>
            )}
          </div>
        )}
        {mode === "number" && <Field id="sf-num" label="Ordinary number" value={num} onChange={setNum} />}
        <p className="text-xs leading-5 text-muted">
          {mode === "number"
            ? "Standard form here means a × 10ⁿ with 1 ≤ a < 10."
            : "Use integers, decimals or fractions such as 2/3. Output is Ax + By = C with whole-number coefficients and A ≥ 0."}
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {line &&
          (line.valid ? (
            <>
              <p className="mt-3 text-xs text-muted">Standard form (Ax + By = C)</p>
              <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{line.equation}</p>
              <p className="mt-3 font-mono text-sm tabular-nums text-muted">
                A = {line.a}, B = {line.b}, C = {line.c}
              </p>
              <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted">
                {line.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">{line.error}</p>
          ))}
        {sci &&
          (sci.valid ? (
            <>
              <p className="mt-3 text-xs text-muted">Standard form (a × 10ⁿ)</p>
              <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{sci.text}</p>
              <p className="mt-3 font-mono text-sm tabular-nums text-muted">
                a = {sci.coefficient}, n = {sci.exponent}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">{sci.error}</p>
          ))}
      </aside>
    </div>
  );
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input id={id} inputMode="text" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} className="input-field font-mono" />
    </label>
  );
}
