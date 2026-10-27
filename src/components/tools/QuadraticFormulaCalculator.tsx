"use client";

import { useState } from "react";
import { formatNumber, solveQuadratic } from "@/lib/quadratic";

function kindLabel(kind: "two-real" | "one-real" | "complex"): string {
  if (kind === "two-real") return "Two real roots";
  if (kind === "one-real") return "One repeated real root";
  return "Two complex roots";
}

export function QuadraticFormulaCalculator() {
  const [a, setA] = useState("1");
  const [b, setB] = useState("-3");
  const [c, setC] = useState("2");
  const result = solveQuadratic(a, b, c);

  const field = (id: string, label: string, value: string, set: (v: string) => void) => (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
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
        <p className="font-mono text-sm">ax² + bx + c = 0</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {field("quadratic-a", "a (not 0)", a, setA)}
          {field("quadratic-b", "b", b, setB)}
          {field("quadratic-c", "c", c, setC)}
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
          <dl className="mt-4 space-y-3 text-sm">
            <Row
              label={result.rootKind === "one-real" ? "Root" : "Roots"}
              value={result.rootsText.join(", ")}
              emphasize
            />
            <Row label="Discriminant" value={formatNumber(result.discriminant)} />
            <Row label="Root type" value={kindLabel(result.rootKind)} />
            <Row label="Vertex" value={`(${formatNumber(result.vertex.x)}, ${formatNumber(result.vertex.y)})`} />
            <Row label="Axis of symmetry" value={`x = ${formatNumber(result.axisOfSymmetry)}`} />
            <Row label="Parabola opens" value={result.opens === "up" ? "Up" : "Down"} />
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
