"use client";

import { useState } from "react";
import { SoftWashQuoteForm } from "@/components/tools/SoftWashQuoteForm";
import {
  CLEANABILITY_SOILS,
  CLEANABILITY_SOIL_LABELS,
  SIDING_AGE_BANDS,
  SIDING_AGE_LABELS,
  SIDING_KIND_LABELS,
  SIDING_KINDS,
  scoreVinylCleanability,
  type CleanabilitySoil,
  type FitScore,
  type SidingAgeBand,
  type SidingKind,
} from "@/lib/vinyl-siding-cleanability";

const fitLabels: Record<FitScore, string> = {
  good: "Good",
  caution: "Caution",
  skip: "Skip",
};

export function VinylSidingCleanability() {
  const [siding, setSiding] = useState<SidingKind>("vinyl");
  const [soil, setSoil] = useState<CleanabilitySoil>("algae");
  const [age, setAge] = useState<SidingAgeBand>("10-20");
  const [shade, setShade] = useState<"yes" | "no">("yes");

  const result = scoreVinylCleanability({
    siding,
    soil,
    age,
    shade: shade === "yes",
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <form
          className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Siding type</legend>
            <div className="grid grid-cols-2 gap-2">
              {SIDING_KINDS.map((id) => (
                <label
                  key={id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="siding"
                    value={id}
                    checked={siding === id}
                    onChange={() => setSiding(id)}
                    className="accent-mint"
                  />
                  {SIDING_KIND_LABELS[id]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Soil</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {CLEANABILITY_SOILS.map((id) => (
                <label
                  key={id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="soil"
                    value={id}
                    checked={soil === id}
                    onChange={() => setSoil(id)}
                    className="accent-mint"
                  />
                  {CLEANABILITY_SOIL_LABELS[id]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Age band</legend>
            <div className="grid grid-cols-3 gap-2">
              {SIDING_AGE_BANDS.map((id) => (
                <label
                  key={id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="age"
                    value={id}
                    checked={age === id}
                    onChange={() => setAge(id)}
                    className="accent-mint"
                  />
                  {SIDING_AGE_LABELS[id]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Mostly shaded?</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="shade"
                  value="yes"
                  checked={shade === "yes"}
                  onChange={() => setShade("yes")}
                  className="accent-mint"
                />
                Yes
              </label>
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="shade"
                  value="no"
                  checked={shade === "no"}
                  onChange={() => setShade("no")}
                  className="accent-mint"
                />
                No
              </label>
            </div>
          </fieldset>

          <p className="text-sm leading-6 text-muted">
            Scoring stays in this browser. A quote request is sent only if you
            submit the form below.
          </p>
        </form>

        <aside
          className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
          aria-live="polite"
        >
          <h2 className="text-lg font-semibold">Soft-wash fit</h2>
          {result.valid && result.fit ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">Score</dt>
                <dd className="text-right font-mono text-lg font-medium tabular-nums text-mint">
                  {fitLabels[result.fit]}
                </dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="text-muted">Why</dt>
                <dd className="mt-1 leading-6 text-text">{result.why}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">
              {result.error ?? "Choose siding, soil, age, and shade to see an educational fit score."}
            </p>
          )}
          <p className="mt-4 text-xs leading-5 text-muted">
            Educational only. Not a material inspection, warranty reading, or
            service claim.
          </p>
        </aside>
      </div>

      <SoftWashQuoteForm
        source="vinyl-siding-cleanability"
        ready={result.valid}
        defaultSurface="siding"
        defaultSqFt={null}
      />
    </div>
  );
}
