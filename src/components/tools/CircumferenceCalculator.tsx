"use client";

import { useState } from "react";
import { CIRCLE_LABELS, solveCircle, type CircleKnown } from "@/lib/circumference";

const UNITS = ["in", "ft", "yd", "mm", "cm", "m", "km", "mi"];
const KNOWNS: CircleKnown[] = ["radius", "diameter", "circumference", "area"];

export function CircumferenceCalculator() {
  const [known, setKnown] = useState<CircleKnown>("radius");
  const [value, setValue] = useState("5");
  const [unit, setUnit] = useState("in");
  const r = solveCircle(known, value, unit);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">I know the</legend>
          <div className="flex flex-wrap gap-2">
            {KNOWNS.map((k) => (
              <label key={k} className="chip inline-flex cursor-pointer items-center gap-2">
                <input type="radio" name="circle-known" value={k} checked={known === k} onChange={() => setKnown(k)} />
                {CIRCLE_LABELS[k]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm" htmlFor="circle-value">
            <span className="mb-2 block text-xs text-muted">
              {CIRCLE_LABELS[known]}
              {known === "area" ? " (square units)" : ""}
            </span>
            <input
              id="circle-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              className="input-field font-mono"
            />
          </label>
          <label className="block text-sm" htmlFor="circle-unit">
            <span className="mb-2 block text-xs text-muted">Unit</span>
            <select id="circle-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="input-field">
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-sm leading-6 text-muted">
          Pick the measurement you have, type it in, and the calculator solves the other three. Answers are shown in terms of
          π and as decimals. Area uses square units. Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Your circle</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">C = {r.circumferenceExpr}</p>
            <dl className="grid grid-cols-1 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Radius</dt>
              <dd>r = {r.radiusExpr}</dd>
              <dt className="font-sans text-muted">Diameter</dt>
              <dd>d = {r.diameterExpr}</dd>
              <dt className="font-sans text-muted">Circumference</dt>
              <dd>C = {r.circumferenceExpr}</dd>
              <dt className="font-sans text-muted">Area</dt>
              <dd>A = {r.areaExpr}</dd>
            </dl>
            <p className="text-xs leading-5 text-muted">
              Formulas: d = 2r, C = 2πr = πd, A = πr². Decimals use π ≈ 3.14159265 and are rounded to 4 places.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
