"use client";

import { useState } from "react";
import { computePercentage, formatPercentNumber, type PercentageMode } from "@/lib/percentage";

const MODES: { id: PercentageMode; label: string; xLabel: string; yLabel: string; question: (x: string, y: string) => string }[] = [
  {
    id: "percent-of",
    label: "What is X% of Y?",
    xLabel: "Percent (X %)",
    yLabel: "Of number (Y)",
    question: (x, y) => `What is ${x}% of ${y}?`,
  },
  {
    id: "what-percent",
    label: "X is what % of Y?",
    xLabel: "Part (X)",
    yLabel: "Whole (Y)",
    question: (x, y) => `${x} is what percent of ${y}?`,
  },
  {
    id: "percent-change",
    label: "Percent change X → Y",
    xLabel: "From (X)",
    yLabel: "To (Y)",
    question: (x, y) => `What is the percent change from ${x} to ${y}?`,
  },
];

const DEFAULTS: Record<PercentageMode, { x: string; y: string }> = {
  "percent-of": { x: "20", y: "150" },
  "what-percent": { x: "30", y: "150" },
  "percent-change": { x: "50", y: "75" },
};

export function PercentageCalculator() {
  const [mode, setMode] = useState<PercentageMode>("percent-of");
  const [values, setValues] = useState(DEFAULTS);
  const { x, y } = values[mode];
  const active = MODES.find((m) => m.id === mode) ?? MODES[0];
  const result = computePercentage(mode, x, y);
  const f = formatPercentNumber;

  const update = (field: "x" | "y", value: string) =>
    setValues((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));

  let answer = "";
  let steps: string[] = [];
  if (result.valid) {
    if (result.mode === "percent-of") {
      answer = f(result.value);
      steps = [
        `Convert the percent to a decimal: ${f(result.x)} ÷ 100 = ${f(result.x / 100)}`,
        `Multiply by the number: ${f(result.x / 100)} × ${f(result.y)} = ${f(result.value)}`,
        `${f(result.x)}% of ${f(result.y)} is ${f(result.value)}`,
      ];
    } else if (result.mode === "what-percent") {
      answer = `${f(result.value)}%`;
      steps = [
        `Divide the part by the whole: ${f(result.x)} ÷ ${f(result.y)} = ${f(result.x / result.y)}`,
        `Multiply by 100: ${f(result.x / result.y)} × 100 = ${f(result.value)}%`,
        `${f(result.x)} is ${f(result.value)}% of ${f(result.y)}`,
      ];
    } else {
      const diff = result.difference ?? 0;
      answer =
        result.direction === "no change"
          ? "0% (no change)"
          : `${f(Math.abs(result.value))}% ${result.direction}`;
      steps = [
        `Find the difference: ${f(result.y)} − ${f(result.x)} = ${f(diff)}`,
        `Divide by the starting value: ${f(diff)} ÷ ${f(Math.abs(result.x))} = ${f(diff / Math.abs(result.x))}`,
        `Multiply by 100: ${f(diff / Math.abs(result.x))} × 100 = ${f(result.value)}%`,
      ];
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Calculation</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Percentage calculation type">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  mode === m.id ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm" htmlFor="pct-x">
            <span className="mb-2 block text-xs text-muted">{active.xLabel}</span>
            <input
              id="pct-x"
              value={x}
              onChange={(e) => update("x", e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="input-field font-mono"
            />
          </label>
          <label className="block text-sm" htmlFor="pct-y">
            <span className="mb-2 block text-xs text-muted">{active.yLabel}</span>
            <input
              id="pct-y"
              value={y}
              onChange={(e) => update("y", e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="input-field font-mono"
            />
          </label>
        </div>
        {result.valid ? (
          <div className="space-y-3 text-sm">
            <h3 className="text-xs text-muted">Step-by-step work</h3>
            <ol className="list-decimal space-y-2 pl-5 font-mono tabular-nums leading-7">
              {steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-muted">{active.question(f(result.x), f(result.y))}</p>
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">{answer}</p>
            {result.mode === "percent-change" ? (
              <p className="text-muted">
                Difference: <span className="font-mono text-text">{f(result.difference ?? 0)}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
      </aside>
    </div>
  );
}
