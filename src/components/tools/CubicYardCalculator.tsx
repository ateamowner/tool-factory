"use client";

import { useState } from "react";
import {
  calculateCubicYards,
  formatFeet,
  formatVolume,
  parseDimension,
  type CubicYardMode,
  type LengthUnit,
} from "@/lib/cubic-yard";

const MODE_OPTIONS: { id: CubicYardMode; label: string; hint: string }[] = [
  {
    id: "rectangle",
    label: "Rectangle",
    hint: "Length × width × depth. Inches are divided by 12, then cubic feet are divided by 27.",
  },
  {
    id: "cylinder",
    label: "Cylinder",
    hint: "Diameter × depth for a round column or circular bed. Volume is π × radius² × depth.",
  },
];

export function CubicYardCalculator() {
  const [mode, setMode] = useState<CubicYardMode>("rectangle");
  const [length, setLength] = useState("10");
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>("ft");
  const [width, setWidth] = useState("10");
  const [widthUnit, setWidthUnit] = useState<LengthUnit>("ft");
  const [diameter, setDiameter] = useState("4");
  const [diameterUnit, setDiameterUnit] = useState<LengthUnit>("ft");
  const [depth, setDepth] = useState("3");
  const [depthUnit, setDepthUnit] = useState<LengthUnit>("in");
  const [bagCubicFeet, setBagCubicFeet] = useState("2");

  const bagText = bagCubicFeet.trim();
  const result = calculateCubicYards({
    mode,
    length: parseDimension(length),
    lengthUnit,
    width: parseDimension(width),
    widthUnit,
    diameter: parseDimension(diameter),
    diameterUnit,
    depth: parseDimension(depth),
    depthUnit,
    bagCubicFeet: bagText === "" ? null : parseDimension(bagCubicFeet),
  });

  const activeMode = MODE_OPTIONS.find((option) => option.id === mode);
  const formula =
    result.valid && result.depthFt !== null
      ? result.mode === "rectangle" && result.lengthFt !== null && result.widthFt !== null
        ? `(${formatFeet(result.lengthFt)} × ${formatFeet(result.widthFt)} × ${formatFeet(result.depthFt)}) / 27`
        : result.diameterFt !== null
          ? `(π × (${formatFeet(result.diameterFt / 2)})² × ${formatFeet(result.depthFt)}) / 27`
          : "—"
      : "—";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Shape</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="cubic-yard-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{activeMode?.hint}</p>
        </fieldset>

        {mode === "rectangle" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <DimensionField
              label="Length"
              name="length"
              value={length}
              onChange={setLength}
              unit={lengthUnit}
              onUnit={setLengthUnit}
              placeholder="10"
              hint="Feet or inches. Must be 0 or more."
            />
            <DimensionField
              label="Width"
              name="width"
              value={width}
              onChange={setWidth}
              unit={widthUnit}
              onUnit={setWidthUnit}
              placeholder="10"
              hint="Feet or inches. Must be 0 or more."
            />
          </div>
        ) : (
          <DimensionField
            label="Diameter"
            name="diameter"
            value={diameter}
            onChange={setDiameter}
            unit={diameterUnit}
            onUnit={setDiameterUnit}
            placeholder="4"
            hint="Distance across the circle. Radius is half of this, in feet."
          />
        )}

        <DimensionField
          label="Depth"
          name="depth"
          value={depth}
          onChange={setDepth}
          unit={depthUnit}
          onUnit={setDepthUnit}
          placeholder="3"
          hint="Inches or feet. 3 inches is a common mulch depth. Inches are divided by 12 first."
        />

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Bag size (optional, cubic feet)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={bagCubicFeet}
            onChange={(event) => setBagCubicFeet(event.target.value)}
            className="input-field"
            placeholder="2"
          />
          <span className="mt-2 block text-muted">
            Leave blank to skip. A typical mulch or soil bag is 2 cubic feet. Bags round up.
          </span>
        </label>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Volume results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Cubic yards"
            value={
              result.valid && result.cubicYards !== null
                ? formatVolume(result.cubicYards, "yd³")
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Cubic feet"
            value={
              result.valid && result.cubicFeet !== null
                ? formatVolume(result.cubicFeet, "ft³")
                : "—"
            }
          />
          <ResultRow
            label="Bags"
            value={
              result.valid && result.bags !== null
                ? `${result.bags.toLocaleString("en-US")} bags`
                : "—"
            }
          />
          <ResultRow label="Formula" value={formula} />
        </dl>

        {result.valid && result.cubicYards !== null && result.cubicFeet !== null ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {result.mode === "rectangle"
              ? `${formatFeet(result.lengthFt ?? 0)} × ${formatFeet(result.widthFt ?? 0)} × ${formatFeet(result.depthFt ?? 0)} is ${formatVolume(result.cubicYards, "yd³")} (${formatVolume(result.cubicFeet, "ft³")}).`
              : `A ${formatFeet(result.diameterFt ?? 0)} diameter at ${formatFeet(result.depthFt ?? 0)} deep is ${formatVolume(result.cubicYards, "yd³")} (${formatVolume(result.cubicFeet, "ft³")}).`}
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational volume estimate for mulch, gravel, concrete, soil, or sand.
            Not a bid, survey, or engineering spec. Compaction and waste are not included.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter dimensions of 0 or more. Cubic yards equal length × width × depth in feet, divided by 27."}
          </p>
        )}
      </aside>
    </div>
  );
}

function DimensionField({
  label,
  name,
  value,
  onChange,
  unit,
  onUnit,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  unit: LengthUnit;
  onUnit: (unit: LengthUnit) => void;
  placeholder: string;
  hint: string;
}) {
  return (
    <div className="block text-sm">
      <label htmlFor={`${name}-value`} className="mb-2 block text-xs text-muted">
        {label}
      </label>
      <input
        id={`${name}-value`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(
          [
            ["ft", "Feet"],
            ["in", "Inches"],
          ] as const
        ).map(([id, unitLabel]) => (
          <label
            key={id}
            className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
          >
            <input
              type="radio"
              name={`${name}-unit`}
              value={id}
              checked={unit === id}
              onChange={() => onUnit(id)}
              className="accent-mint"
            />
            {unitLabel}
          </label>
        ))}
      </div>
      <span className="mt-2 block text-muted">{hint}</span>
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`text-right font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
