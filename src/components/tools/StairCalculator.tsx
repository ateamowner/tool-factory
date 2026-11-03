"use client";

import { useState } from "react";
import { computeStairs, formatFeetInches, type StairInput } from "@/lib/stair";

function Field({
  id,
  label,
  unit,
  value,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <div className="flex items-center gap-1">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          className="input-field font-mono"
        />
        {unit ? <span className="text-xs text-muted">{unit}</span> : null}
      </div>
    </label>
  );
}

const inch = (n: number) => `${n.toFixed(2)} in`;

export function StairCalculator() {
  const [input, setInput] = useState<StairInput>({ totalRiseIn: "108", maxRiserIn: "7.75", treadDepthIn: "10" });
  const set = (key: keyof StairInput) => (v: string) => setInput((prev) => ({ ...prev, [key]: v }));
  const r = computeStairs(input);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="stair-rise" label="Total rise (floor to floor)" unit="in" value={input.totalRiseIn} onChange={set("totalRiseIn")} />
          <Field id="stair-max-riser" label="Max riser height" unit="in" value={input.maxRiserIn} onChange={set("maxRiserIn")} />
          <Field id="stair-tread" label="Tread depth" unit="in" value={input.treadDepthIn} onChange={set("treadDepthIn")} />
        </div>
        <p className="text-sm leading-6 text-muted">
          Measure total rise from the top of the lower finished floor to the top of the upper finished floor. The calculator
          picks the fewest equal risers that stay at or under your max riser height. Tread depth is measured without the
          nosing. Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Your stairs</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">
              {r.risers} steps of {inch(r.riserHeightIn)}
            </p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Risers</dt>
              <dd className="text-right">{r.risers}</dd>
              <dt className="font-sans text-muted">Treads</dt>
              <dd className="text-right">{r.treads}</dd>
              <dt className="font-sans text-muted">Riser height</dt>
              <dd className="text-right">{inch(r.riserHeightIn)}</dd>
              <dt className="font-sans text-muted">Tread depth</dt>
              <dd className="text-right">{inch(r.treadDepthIn)}</dd>
              <dt className="font-sans text-muted">Total run</dt>
              <dd className="text-right">{formatFeetInches(r.totalRunIn)}</dd>
              <dt className="font-sans text-muted">Stringer length</dt>
              <dd className="text-right">{formatFeetInches(r.stringerLengthIn)}</dd>
              <dt className="font-sans text-muted">Stair angle</dt>
              <dd className="text-right">{r.angleDeg.toFixed(1)}°</dd>
              <dt className="font-sans text-muted">2R + T</dt>
              <dd className="text-right">{inch(r.comfortSum)}</dd>
            </dl>
            {r.warnings.length > 0 ? (
              <ul className="space-y-1 rounded-xl border border-line p-3 leading-6">
                {r.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-line p-3 leading-6">
                Within typical residential limits (riser 7.75 in or less, tread 10 in or more).
              </p>
            )}
            <p className="text-xs leading-5 text-muted">
              Limits shown are typical residential values, not your local code. Check with your building department before you
              cut stringers. Stringer length is the diagonal of the flight and does not include extra for the top or bottom cut.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
