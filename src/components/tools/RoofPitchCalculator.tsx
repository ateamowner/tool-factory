"use client";

import { useState } from "react";
import { COMMON_PITCHES, computeRoofPitch, formatPitch, pitchFromAngle } from "@/lib/roof-pitch";

const unitOptions = ["inches", "feet", "meters", "centimeters"] as const;

export function RoofPitchCalculator() {
  const [rise, setRise] = useState("6");
  const [run, setRun] = useState("12");
  const [unit, setUnit] = useState<(typeof unitOptions)[number]>("inches");
  const [angle, setAngle] = useState("");

  const result = computeRoofPitch({ rise: Number(rise), run: Number(run) });
  const fromAngle = angle.trim() === "" ? null : pitchFromAngle(Number(angle));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,1fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm" htmlFor="pitch-rise">
            <span className="mb-2 block text-xs text-muted">Rise (vertical)</span>
            <input id="pitch-rise" type="number" inputMode="decimal" min="0" step="any" value={rise} onChange={(e) => setRise(e.target.value)} className="input-field" />
          </label>
          <label className="block text-sm" htmlFor="pitch-run">
            <span className="mb-2 block text-xs text-muted">Run (horizontal)</span>
            <input id="pitch-run" type="number" inputMode="decimal" min="0" step="any" value={run} onChange={(e) => setRun(e.target.value)} className="input-field" />
          </label>
        </div>
        <label className="block text-sm" htmlFor="pitch-unit">
          <span className="mb-2 block text-xs text-muted">Unit (same for both)</span>
          <select id="pitch-unit" value={unit} onChange={(e) => setUnit(e.target.value as (typeof unitOptions)[number])} className="input-field">
            {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {[4, 6, 8, 12].map((p) => (
            <button key={p} type="button" className="chip" onClick={() => { setRise(String(p)); setRun("12"); setUnit("inches"); }}>
              {p}/12
            </button>
          ))}
        </div>
        <label className="block border-t border-line pt-4 text-sm" htmlFor="pitch-angle">
          <span className="mb-2 block text-xs text-muted">Or convert an angle (degrees) to pitch</span>
          <input id="pitch-angle" type="number" inputMode="decimal" min="0" max="89.9" step="any" value={angle} onChange={(e) => setAngle(e.target.value)} className="input-field" placeholder="e.g. 30" />
        </label>
        {fromAngle !== null && (
          <p className="text-sm text-muted" role="status">
            {angle}° is a pitch of <strong className="text-text">{formatPitch(fromAngle)}</strong>.
          </p>
        )}
      </form>

      <div className="rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        {result.valid ? (
          <>
            <p className="text-sm text-muted">Roof pitch</p>
            <p className="mt-1 text-4xl font-[650] tracking-tight">{formatPitch(result.pitchPer12)}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Angle</dt>
                <dd className="text-xl font-semibold">{result.angleDegrees.toFixed(2)}°</dd>
              </div>
              <div>
                <dt className="text-muted">Slope</dt>
                <dd className="text-xl font-semibold">{result.slopePercent.toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-muted">Rafter multiplier</dt>
                <dd className="text-xl font-semibold">{result.rafterMultiplier.toFixed(4)}</dd>
              </div>
              <div>
                <dt className="text-muted">Rafter length for this run</dt>
                <dd className="text-xl font-semibold">{result.rafterLength.toFixed(2)} {unit}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              Multiply flat plan area by {result.areaFactor.toFixed(4)} for sloped roof surface area.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted" role="alert">{result.error}</p>
        )}
        <table className="mt-6 w-full text-left text-xs">
          <caption className="mb-2 text-left text-muted">Common pitches</caption>
          <thead><tr className="text-muted"><th className="py-1">Pitch</th><th>Angle</th><th>Slope</th></tr></thead>
          <tbody>
            {COMMON_PITCHES.map((c) => {
              const r = computeRoofPitch({ rise: c.pitch, run: 12 });
              return r.valid ? (
                <tr key={c.pitch} className="border-t border-line">
                  <td className="py-1">{c.pitch}/12</td>
                  <td>{r.angleDegrees.toFixed(1)}°</td>
                  <td>{r.slopePercent.toFixed(0)}%</td>
                </tr>
              ) : null;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
