"use client";

import { useState } from "react";
import { SoftWashQuoteForm } from "@/components/tools/SoftWashQuoteForm";
import {
  ROOF_AGE_BANDS,
  ROOF_AGE_LABELS,
  STREAK_COVERAGE_LABELS,
  STREAK_COVERAGES,
  scoreRoofAlgae,
  type RoofAgeBand,
  type StreakCoverage,
} from "@/lib/roof-algae-severity";

export function RoofAlgaeSeverity() {
  const [coverage, setCoverage] = useState<StreakCoverage>("light");
  const [age, setAge] = useState<RoofAgeBand>("10-20");
  const [treeCover, setTreeCover] = useState<"yes" | "no">("no");
  const [northFace, setNorthFace] = useState<"yes" | "no">("no");

  const result = scoreRoofAlgae({
    coverage,
    age,
    treeCover: treeCover === "yes",
    northFace: northFace === "yes",
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <form
          className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Streak coverage</legend>
            <div className="grid grid-cols-2 gap-2">
              {STREAK_COVERAGES.map((id) => (
                <label
                  key={id}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
                >
                  <input
                    type="radio"
                    name="coverage"
                    value={id}
                    checked={coverage === id}
                    onChange={() => setCoverage(id)}
                    className="accent-mint"
                  />
                  {STREAK_COVERAGE_LABELS[id]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Roof age band</legend>
            <div className="grid grid-cols-3 gap-2">
              {ROOF_AGE_BANDS.map((id) => (
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
                  {ROOF_AGE_LABELS[id]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Tree cover over the roof?</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="trees"
                  value="yes"
                  checked={treeCover === "yes"}
                  onChange={() => setTreeCover("yes")}
                  className="accent-mint"
                />
                Yes
              </label>
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="trees"
                  value="no"
                  checked={treeCover === "no"}
                  onChange={() => setTreeCover("no")}
                  className="accent-mint"
                />
                No
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">North-facing slope?</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="north"
                  value="yes"
                  checked={northFace === "yes"}
                  onChange={() => setNorthFace("yes")}
                  className="accent-mint"
                />
                Yes
              </label>
              <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
                <input
                  type="radio"
                  name="north"
                  value="no"
                  checked={northFace === "no"}
                  onChange={() => setNorthFace("no")}
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
          <h2 className="text-lg font-semibold">Severity score</h2>
          {result.valid && result.severity !== null ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">Severity</dt>
                <dd className="text-right font-mono text-lg font-medium tabular-nums text-mint">
                  {result.severity} / 4
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">Typical soft-wash candidate</dt>
                <dd className="text-right font-medium">
                  {result.typicalCandidate ? "Yes, from appearance" : "No, from these answers"}
                </dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="text-muted">Note</dt>
                <dd className="mt-1 leading-6 text-text">{result.note}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">
              {result.error ?? "Choose coverage, age, trees, and north face to see a 1–4 score."}
            </p>
          )}
          <p className="mt-4 text-xs leading-5 text-muted">
            Educational only. Not a roof inspection, leak test, or diagnosis.
          </p>
        </aside>
      </div>

      <SoftWashQuoteForm
        source="roof-algae-severity"
        ready={result.valid}
        defaultSurface="roof"
        defaultSqFt={null}
      />
    </div>
  );
}
