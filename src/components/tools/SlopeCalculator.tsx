"use client";

import { useState } from "react";
import { computeSlope, formatSlopeNumber } from "@/lib/slope";

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
    </label>
  );
}

export function SlopeCalculator() {
  const [x1, setX1] = useState("1");
  const [y1, setY1] = useState("2");
  const [x2, setX2] = useState("3");
  const [y2, setY2] = useState("6");
  const result = computeSlope(x1, y1, x2, y2);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field id="slope-x1" label="x₁" value={x1} onChange={setX1} placeholder="1" />
          <Field id="slope-y1" label="y₁" value={y1} onChange={setY1} placeholder="2" />
          <Field id="slope-x2" label="x₂" value={x2} onChange={setX2} placeholder="3" />
          <Field id="slope-y2" label="y₂" value={y2} onChange={setY2} placeholder="6" />
        </div>
        <p className="text-sm leading-6 text-muted">
          Slope is rise over run: m = (y₂ − y₁) / (x₂ − x₁). A vertical line (same x) has undefined slope.
        </p>
        {result.valid && !result.vertical ? (
          <div className="space-y-2 text-sm">
            <h3 className="text-xs text-muted">Working</h3>
            <p className="font-mono tabular-nums leading-7">
              m = ({formatSlopeNumber(result.y2)} − {formatSlopeNumber(result.y1)}) / (
              {formatSlopeNumber(result.x2)} − {formatSlopeNumber(result.x1)}) ={" "}
              {formatSlopeNumber(result.rise)} / {formatSlopeNumber(result.run)} ={" "}
              {formatSlopeNumber(result.slope!)}
            </p>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row
              label="Slope (m)"
              value={result.vertical ? "Undefined (vertical)" : formatSlopeNumber(result.slope!)}
              emphasize
            />
            <Row label="Rise" value={formatSlopeNumber(result.rise)} />
            <Row label="Run" value={formatSlopeNumber(result.run)} />
            <Row
              label="Angle"
              value={
                result.angleDegrees === null
                  ? "—"
                  : `${formatSlopeNumber(Math.round(result.angleDegrees * 1000) / 1000)}°`
              }
            />
            <Row
              label="y-intercept"
              value={result.intercept === null ? "—" : formatSlopeNumber(result.intercept)}
            />
            <Row label="Equation" value={result.equation} />
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
