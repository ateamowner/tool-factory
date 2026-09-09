"use client";

import { useMemo, useState } from "react";
import { SoftWashQuoteForm } from "@/components/tools/SoftWashQuoteForm";
import {
  DEFAULT_STOCK_SH_PERCENT,
  DEFAULT_SURFACTANT_OZ_PER_GAL,
  MAX_SURFACTANT_OZ_PER_GAL,
  MIN_SURFACTANT_OZ_PER_GAL,
  SOILS,
  SURFACE_PRESETS,
  SURFACES,
  computeSoftWashMix,
  formatShPercent,
  resolveWashArea,
  shRangeLabel,
  type SoilId,
  type SurfaceId,
} from "@/lib/soft-wash-mix";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function gallons(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: value >= 10 && Number.isInteger(value) ? 0 : 1,
  })} gal`;
}

function ounces(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} oz`;
}

export function SoftWashMixCalculator() {
  const [surface, setSurface] = useState<SurfaceId>("siding");
  const [soil, setSoil] = useState<SoilId>("medium");
  const [areaMode, setAreaMode] = useState<"sqft" | "dimensions">("sqft");
  const [sqFt, setSqFt] = useState("1800");
  const [lengthFt, setLengthFt] = useState("");
  const [widthFt, setWidthFt] = useState("");
  const [stories, setStories] = useState<"" | "1" | "2">("");
  const [stockSh, setStockSh] = useState(String(DEFAULT_STOCK_SH_PERCENT));
  const [surfactantOz, setSurfactantOz] = useState(String(DEFAULT_SURFACTANT_OZ_PER_GAL));
  const areaSqFt = resolveWashArea({
    mode: areaMode,
    sqFt: parseAmount(sqFt),
    lengthFt: parseAmount(lengthFt),
    widthFt: parseAmount(widthFt),
    stories: stories === "2" ? 2 : stories === "1" ? 1 : null,
  });

  const result = computeSoftWashMix({
    surface,
    areaSqFt: areaSqFt ?? Number.NaN,
    soil,
    stockShPercent: parseAmount(stockSh),
    surfactantOzPerGal: parseAmount(surfactantOz),
  });

  const quoteReady = result.valid && areaSqFt !== null;

  const surfactantHint = useMemo(
    () =>
      `Typical pro range ${MIN_SURFACTANT_OZ_PER_GAL}–${MAX_SURFACTANT_OZ_PER_GAL} oz per gallon of mix.`,
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <form
          className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Surface</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SURFACES.map((id) => (
                <label
                  key={id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="surface"
                    value={id}
                    checked={surface === id}
                    onChange={() => setSurface(id)}
                    className="accent-mint"
                  />
                  {SURFACE_PRESETS[id].label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">{shRangeLabel(surface)}</p>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Area</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="area-mode"
                  value="sqft"
                  checked={areaMode === "sqft"}
                  onChange={() => setAreaMode("sqft")}
                  className="accent-mint"
                />
                Square feet
              </label>
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="area-mode"
                  value="dimensions"
                  checked={areaMode === "dimensions"}
                  onChange={() => setAreaMode("dimensions")}
                  className="accent-mint"
                />
                Length × width
              </label>
            </div>
            {areaMode === "sqft" ? (
              <label className="mt-3 block text-sm">
                <span className="mb-2 block text-xs text-muted">Square feet to wash</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={sqFt}
                  onChange={(event) => setSqFt(event.target.value)}
                  className="input-field"
                  placeholder="1800"
                />
              </label>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-2 block text-xs text-muted">Length (ft)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={lengthFt}
                    onChange={(event) => setLengthFt(event.target.value)}
                    className="input-field"
                    placeholder="40"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block text-xs text-muted">Width (ft)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={widthFt}
                    onChange={(event) => setWidthFt(event.target.value)}
                    className="input-field"
                    placeholder="20"
                  />
                </label>
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Soil</legend>
            <div className="grid grid-cols-3 gap-2">
              {SOILS.map((id) => (
                <label
                  key={id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm capitalize has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="soil"
                    value={id}
                    checked={soil === id}
                    onChange={() => setSoil(id)}
                    className="accent-mint"
                  />
                  {id}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">
              Heavy soil uses the high end of the typical pro range.
            </p>
          </fieldset>

          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Stories (optional)</span>
            <select
              value={stories}
              onChange={(event) => setStories(event.target.value as "" | "1" | "2")}
              className="input-field max-w-xs"
            >
              <option value="">Not specified</option>
              <option value="1">1 story</option>
              <option value="2">2 stories</option>
            </select>
            <span className="mt-2 block text-muted">
              Used only with length × width (multiplies that face). Square feet is used as entered.
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Stock SH % (jug strength)</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={stockSh}
                onChange={(event) => setStockSh(event.target.value)}
                className="input-field"
                placeholder="12.5"
              />
              <span className="mt-2 block text-muted">
                Default 12.5% is typical professional sodium hypochlorite.
              </span>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Surfactant oz / gal</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={surfactantOz}
                onChange={(event) => setSurfactantOz(event.target.value)}
                className="input-field"
                placeholder="1.5"
              />
              <span className="mt-2 block text-muted">{surfactantHint}</span>
            </label>
          </div>

          <p className="text-sm leading-6 text-muted">
            Mix math stays in this browser. A quote request is sent only if you
            submit the form below.
          </p>
        </form>

        <aside
          className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
          aria-live="polite"
        >
          <h2 className="text-lg font-semibold">Mix estimate</h2>
          {result.valid ? (
            <dl className="mt-4 space-y-3 text-sm">
              <ResultRow label="Finished mix" value={gallons(result.mixGallons)} emphasize />
              <ResultRow label="Bleach (stock SH)" value={gallons(result.bleachGallons)} />
              <ResultRow label="Water" value={gallons(result.waterGallons)} />
              <ResultRow label="Surfactant" value={ounces(result.surfactantOz)} />
              <ResultRow
                label="Target SH"
                value={
                  result.targetShPercent === null
                    ? "—"
                    : `${formatShPercent(result.targetShPercent)} · ${result.shRangeLabel}`
                }
              />
              <div className="border-t border-line pt-3">
                <dt className="text-muted">Dwell / rinse</dt>
                <dd className="mt-1 leading-6 text-text">{result.dwellTip}</dd>
              </div>
              <p className="pt-1 text-xs leading-5 text-muted">{result.coverageLabel}</p>
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">
              {result.error ?? "Enter a surface and area to see gallons of mix, bleach, water, and surfactant."}
            </p>
          )}
          <p className="mt-4 text-xs leading-5 text-muted">
            Educational only. Follow local codes and protect plants, people, and
            property. This is not a chemical specification.
          </p>
        </aside>
      </div>

      <SoftWashQuoteForm
        source="soft-wash-mix-calculator"
        ready={quoteReady}
        defaultSurface={surface}
        defaultSqFt={areaSqFt}
        mixGallons={result.mixGallons}
      />
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
