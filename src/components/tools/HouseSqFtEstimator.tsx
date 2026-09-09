"use client";

import Link from "next/link";
import { useState } from "react";
import { SoftWashQuoteForm } from "@/components/tools/SoftWashQuoteForm";
import {
  HOUSE_STORIES,
  WALL_HEIGHT_FT_PER_STORY,
  estimateHouseSqFt,
  type HouseAreaMode,
  type HouseStories,
  type HouseTarget,
} from "@/lib/house-sq-ft";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function sqFtLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq ft`;
}

export function HouseSqFtEstimator() {
  const [mode, setMode] = useState<HouseAreaMode>("dimensions");
  const [lengthFt, setLengthFt] = useState("40");
  const [widthFt, setWidthFt] = useState("30");
  const [footprintSqFt, setFootprintSqFt] = useState("");
  const [stories, setStories] = useState<HouseStories>(1);
  const [target, setTarget] = useState<HouseTarget>("walls");
  const [pitchBump, setPitchBump] = useState(false);

  const result = estimateHouseSqFt({
    mode,
    lengthFt: parseAmount(lengthFt),
    widthFt: parseAmount(widthFt),
    footprintSqFt: parseAmount(footprintSqFt),
    stories,
    target,
    pitchBump,
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <form
          className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Estimate</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="target"
                  value="walls"
                  checked={target === "walls"}
                  onChange={() => setTarget("walls")}
                  className="accent-mint"
                />
                Walls
              </label>
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="target"
                  value="roof"
                  checked={target === "roof"}
                  onChange={() => setTarget("roof")}
                  className="accent-mint"
                />
                Roof
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Size</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="area-mode"
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
                  name="area-mode"
                  value="footprint"
                  checked={mode === "footprint"}
                  onChange={() => setMode("footprint")}
                  className="accent-mint"
                />
                Footprint
              </label>
            </div>
            {mode === "dimensions" ? (
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
                    placeholder="30"
                  />
                </label>
              </div>
            ) : (
              <label className="mt-3 block text-sm">
                <span className="mb-2 block text-xs text-muted">Footprint (sq ft)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={footprintSqFt}
                  onChange={(event) => setFootprintSqFt(event.target.value)}
                  className="input-field"
                  placeholder="1200"
                />
                <span className="mt-2 block text-muted">
                  Wall mode treats that footprint as a square so a perimeter can be estimated.
                </span>
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Stories</legend>
            <div className="grid grid-cols-2 gap-2">
              {HOUSE_STORIES.map((count) => (
                <label
                  key={count}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="stories"
                    value={count}
                    checked={stories === count}
                    onChange={() => setStories(count)}
                    className="accent-mint"
                  />
                  {count} {count === 1 ? "story" : "stories"}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">
              Stories scale wall height ({WALL_HEIGHT_FT_PER_STORY} ft each). Roof area stays the
              footprint.
            </p>
          </fieldset>

          {target === "roof" ? (
            <label className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="checkbox"
                checked={pitchBump}
                onChange={(event) => setPitchBump(event.target.checked)}
                className="accent-mint"
              />
              Add a typical 6/12 pitch bump
            </label>
          ) : null}

          <p className="text-sm leading-6 text-muted">
            Area math stays in this browser. A quote request is sent only if you
            submit the form below.
          </p>
        </form>

        <aside
          className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
          aria-live="polite"
        >
          <h2 className="text-lg font-semibold">Area estimate</h2>
          {result.valid ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">
                  {target === "walls" ? "Wall sq ft" : "Roof sq ft"}
                </dt>
                <dd className="text-right font-mono text-lg font-medium tabular-nums text-mint">
                  {sqFtLabel(result.estimateSqFt)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">Footprint</dt>
                <dd className="text-right font-mono font-medium tabular-nums">
                  {sqFtLabel(result.footprintSqFt)}
                </dd>
              </div>
              {target === "walls" ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Roof (plan)</dt>
                  <dd className="text-right font-mono font-medium tabular-nums">
                    {sqFtLabel(result.roofSqFt)}
                  </dd>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Walls (ref.)</dt>
                  <dd className="text-right font-mono font-medium tabular-nums">
                    {sqFtLabel(result.wallSqFt)}
                  </dd>
                </div>
              )}
              <p className="pt-1 text-xs leading-5 text-muted">{result.methodLabel}</p>
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">
              {result.error ?? "Enter the house size to see a wall or roof square-foot estimate."}
            </p>
          )}
          <p className="mt-4 text-sm leading-6">
            Use this area in the{" "}
            <Link className="text-mint underline" href="/home/soft-wash-mix-calculator">
              Soft Wash Mix Calculator
            </Link>
            .
          </p>
          <p className="mt-3 text-xs leading-5 text-muted">
            Educational only. This is not a takeoff, a bid, or a promise that a
            wash is needed.
          </p>
        </aside>
      </div>

      <SoftWashQuoteForm
        source="house-sq-ft-estimator"
        ready={result.valid}
        defaultSurface={result.quoteSurface ?? "siding"}
        defaultSqFt={result.estimateSqFt}
      />
    </div>
  );
}
