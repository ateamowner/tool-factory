"use client";

import { useState } from "react";
import {
  SHAPE_FIELDS,
  SHAPE_FORMULAS,
  UNITS,
  convertVolume,
  formatNumber,
  shapeVolume,
  type Shape,
  type Unit,
} from "@/lib/volume";

const SHAPES: { shape: Shape; label: string }[] = [
  { shape: "cube", label: "Cube" },
  { shape: "prism", label: "Rectangular prism" },
  { shape: "cylinder", label: "Cylinder" },
  { shape: "sphere", label: "Sphere" },
  { shape: "cone", label: "Cone" },
  { shape: "pyramid", label: "Pyramid" },
];

const DEFAULTS: Record<string, string> = { side: "3", length: "4", width: "3", height: "5", radius: "2" };

export function VolumeCalculator() {
  const [shape, setShape] = useState<Shape>("prism");
  const [unit, setUnit] = useState<Unit>("ft");
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);

  const fields = SHAPE_FIELDS[shape];
  const dims: Record<string, number> = {};
  let complete = true;
  for (const f of fields) {
    const raw = (values[f.key] ?? "").trim();
    const n = raw === "" ? NaN : Number(raw);
    if (!Number.isFinite(n)) complete = false;
    dims[f.key] = n;
  }
  const volume = complete ? shapeVolume(shape, dims) : null;
  const conv = volume === null ? null : convertVolume(volume, unit);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex flex-wrap gap-2" aria-label="Shape">
          {SHAPES.map((o) => (
            <button
              key={o.shape}
              type="button"
              aria-pressed={shape === o.shape}
              onClick={() => setShape(o.shape)}
              className={`chip inline-flex ${shape === o.shape ? "border-mint text-mint" : ""}`}
            >
              {o.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="flex flex-wrap gap-2" aria-label="Unit">
          {UNITS.map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={unit === u}
              onClick={() => setUnit(u)}
              className={`chip inline-flex ${unit === u ? "border-mint text-mint" : ""}`}
            >
              {u}
            </button>
          ))}
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <label key={f.key} className="block text-sm" htmlFor={`vol-${f.key}`}>
              <span className="mb-2 block text-xs text-muted">
                {f.label} ({unit})
              </span>
              <input
                id={`vol-${f.key}`}
                inputMode="decimal"
                autoComplete="off"
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="input-field font-mono"
              />
            </label>
          ))}
        </div>
        <p className="text-xs leading-5 text-muted">
          Formula: {SHAPE_FORMULAS[shape]}. All dimensions use the selected unit. For a cylinder, sphere or cone, enter the radius, which is half the diameter.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {volume === null || conv === null ? (
          <p className="mt-4 text-sm leading-6 text-muted">Enter every dimension as a number that is zero or greater.</p>
        ) : (
          <>
            <p className="mt-3 text-xs text-muted">Volume</p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">
              {formatNumber(volume)} {unit}³
            </p>
            <dl className="mt-4 space-y-1 font-mono text-sm tabular-nums text-muted">
              <Row label="Cubic meters" value={conv.cubicMeters} />
              <Row label="Liters" value={conv.liters} />
              <Row label="US gallons" value={conv.usGallons} />
              <Row label="Cubic feet" value={conv.cubicFeet} />
              <Row label="Cubic yards" value={conv.cubicYards} />
              <Row label="Cubic inches" value={conv.cubicInches} />
              <Row label="Cubic centimeters" value={conv.cubicCentimeters} />
            </dl>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd>{formatNumber(value)}</dd>
    </div>
  );
}
