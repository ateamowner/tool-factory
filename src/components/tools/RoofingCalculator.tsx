"use client";

import { useState } from "react";
import {
  PITCH_PRESETS,
  calculateRoofing,
  formatFactor,
  formatMoney,
  formatSqFt,
  formatSquares,
  parseAmount,
  type PitchInputMode,
  type PitchPresetId,
  type RoofAreaMode,
} from "@/lib/roofing";

const PITCH_MODES: { id: PitchInputMode; label: string }[] = [
  { id: "preset", label: "Common pitch" },
  { id: "rise", label: "Custom rise/12" },
  { id: "factor", label: "Pitch factor" },
];

export function RoofingCalculator() {
  const [mode, setMode] = useState<RoofAreaMode>("dimensions");
  const [lengthFt, setLengthFt] = useState("40");
  const [widthFt, setWidthFt] = useState("30");
  const [planSqFt, setPlanSqFt] = useState("");
  const [pitchMode, setPitchMode] = useState<PitchInputMode>("preset");
  const [presetId, setPresetId] = useState<PitchPresetId>("6/12");
  const [rise, setRise] = useState("6");
  const [pitchFactor, setPitchFactor] = useState("");
  const [wastePercent, setWastePercent] = useState("10");
  const [pricePerSquare, setPricePerSquare] = useState("");

  const priceText = pricePerSquare.trim();
  const result = calculateRoofing({
    mode,
    lengthFt: parseAmount(lengthFt),
    widthFt: parseAmount(widthFt),
    planSqFt: parseAmount(planSqFt),
    pitchMode,
    presetId,
    rise: parseAmount(rise),
    pitchFactor: parseAmount(pitchFactor),
    wastePercent: parseAmount(wastePercent),
    pricePerSquare: priceText === "" ? null : parseAmount(pricePerSquare),
  });

  const formula =
    result.valid &&
    result.planSqFt !== null &&
    result.pitchFactor !== null &&
    result.surfaceSqFt !== null
      ? `${formatSqFt(result.planSqFt)} × ${formatFactor(result.pitchFactor)} = ${formatSqFt(result.surfaceSqFt)}`
      : "—";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Plan area</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="radio"
                name="roof-area-mode"
                value="dimensions"
                checked={mode === "dimensions"}
                onChange={() => setMode("dimensions")}
                className="accent-mint"
              />
              Length × width
            </label>
            <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="radio"
                name="roof-area-mode"
                value="plan"
                checked={mode === "plan"}
                onChange={() => setMode("plan")}
                className="accent-mint"
              />
              Plan area
            </label>
          </div>
          {mode === "dimensions" ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm" htmlFor="roof-length">
                <span className="mb-2 block text-xs text-muted">Length (ft)</span>
                <input
                  id="roof-length"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={lengthFt}
                  onChange={(event) => setLengthFt(event.target.value)}
                  className="input-field"
                  placeholder="40"
                />
              </label>
              <label className="block text-sm" htmlFor="roof-width">
                <span className="mb-2 block text-xs text-muted">Width (ft)</span>
                <input
                  id="roof-width"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={widthFt}
                  onChange={(event) => setWidthFt(event.target.value)}
                  className="input-field"
                  placeholder="30"
                />
              </label>
            </div>
          ) : (
            <label className="mt-3 block text-sm" htmlFor="roof-plan">
              <span className="mb-2 block text-xs text-muted">Plan area (sq ft)</span>
              <input
                id="roof-plan"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={planSqFt}
                onChange={(event) => setPlanSqFt(event.target.value)}
                className="input-field"
                placeholder="1200"
              />
              <span className="mt-2 block text-muted">
                Footprint of the roof as seen from above, before pitch.
              </span>
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Pitch</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PITCH_MODES.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="roof-pitch-mode"
                  value={option.id}
                  checked={pitchMode === option.id}
                  onChange={() => setPitchMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>

          {pitchMode === "preset" ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {PITCH_PRESETS.map((preset) => (
                <label
                  key={preset.id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="roof-pitch-preset"
                    value={preset.id}
                    checked={presetId === preset.id}
                    onChange={() => setPresetId(preset.id)}
                    className="accent-mint"
                  />
                  {preset.label}
                </label>
              ))}
            </div>
          ) : null}

          {pitchMode === "rise" ? (
            <label className="mt-3 block text-sm" htmlFor="roof-rise">
              <span className="mb-2 block text-xs text-muted">Rise (X in X/12)</span>
              <input
                id="roof-rise"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={rise}
                onChange={(event) => setRise(event.target.value)}
                className="input-field"
                placeholder="6"
              />
              <span className="mt-2 block text-muted">
                Run stays 12. A 6 here is a 6/12 pitch. Use 0 for flat.
              </span>
            </label>
          ) : null}

          {pitchMode === "factor" ? (
            <label className="mt-3 block text-sm" htmlFor="roof-factor">
              <span className="mb-2 block text-xs text-muted">Pitch factor</span>
              <input
                id="roof-factor"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={pitchFactor}
                onChange={(event) => setPitchFactor(event.target.value)}
                className="input-field"
                placeholder="1.118"
              />
              <span className="mt-2 block text-muted">
                Multiplier from 1 to 3. 1.118 is about a 6/12 pitch. 1 is flat.
              </span>
            </label>
          ) : null}

          <p className="mt-2 text-sm leading-6 text-muted">
            Surface area ≈ plan area × √(1 + (rise / 12)²). Pitch is optional:
            choose Flat to keep the surface equal to the plan.
          </p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm" htmlFor="roof-waste">
            <span className="mb-2 block text-xs text-muted">Waste (%)</span>
            <input
              id="roof-waste"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={wastePercent}
              onChange={(event) => setWastePercent(event.target.value)}
              className="input-field"
              placeholder="10"
            />
            <span className="mt-2 block text-muted">
              10% is a common educational default. Use 0 to skip waste.
            </span>
          </label>
          <label className="block text-sm" htmlFor="roof-price">
            <span className="mb-2 block text-xs text-muted">Price per square (optional)</span>
            <input
              id="roof-price"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={pricePerSquare}
              onChange={(event) => setPricePerSquare(event.target.value)}
              className="input-field"
              placeholder=""
            />
            <span className="mt-2 block text-muted">
              Leave blank to skip cost. No default price is filled in.
            </span>
          </label>
        </div>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Roofing results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Roof surface"
            value={
              result.valid && result.surfaceSqFt !== null
                ? formatSqFt(result.surfaceSqFt)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Squares"
            value={
              result.valid && result.squares !== null ? formatSquares(result.squares) : "—"
            }
          />
          <ResultRow
            label="With waste"
            value={
              result.valid && result.adjustedSquares !== null
                ? formatSquares(result.adjustedSquares)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Material cost"
            value={
              result.valid && result.materialCost !== null
                ? formatMoney(result.materialCost)
                : "—"
            }
          />
          <ResultRow
            label="Plan area"
            value={result.valid && result.planSqFt !== null ? formatSqFt(result.planSqFt) : "—"}
          />
          <ResultRow
            label="Pitch"
            value={
              result.valid && result.pitchLabel !== null && result.pitchFactor !== null
                ? `${result.pitchLabel} (${formatFactor(result.pitchFactor)})`
                : "—"
            }
          />
          <ResultRow label="Formula" value={formula} />
        </dl>

        {result.valid &&
        result.surfaceSqFt !== null &&
        result.squares !== null &&
        result.adjustedSquares !== null ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {formatSqFt(result.surfaceSqFt)} is {formatSquares(result.squares)}. With{" "}
            {result.wastePercent}% waste that is {formatSquares(result.adjustedSquares)}.
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational estimate for a simple roof plan. Not a bid, takeoff, or
            engineering spec. Hips, valleys, dormers, and overhangs are not measured.
            {result.materialCost === null
              ? " Material cost stays blank until you enter a price per square."
              : " Cost is adjusted squares times the price you typed."}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter a roof plan, then an optional pitch. One square is 100 square feet."}
          </p>
        )}
      </aside>
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
