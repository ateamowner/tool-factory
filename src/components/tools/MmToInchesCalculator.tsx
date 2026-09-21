"use client";

import { useState } from "react";
import {
  convertMmInches,
  formatInchFraction,
  formatLength,
  type MmToInchesMode,
} from "@/lib/mm-to-inches";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

const MODE_OPTIONS: { id: MmToInchesMode; label: string; hint: string }[] = [
  {
    id: "mm_to_in",
    label: "mm → inches",
    hint: "Divide millimeters by 25.4 for decimal inches and a nearest 1/64 in fraction.",
  },
  {
    id: "in_to_mm",
    label: "inches → mm",
    hint: "Multiply inches by 25.4 for millimeters. The same international inch is used both ways.",
  },
];

export function MmToInchesCalculator() {
  const [mode, setMode] = useState<MmToInchesMode>("mm_to_in");
  const [millimeters, setMillimeters] = useState("25.4");
  const [inches, setInches] = useState("1");

  const result = convertMmInches({
    mode,
    millimeters: parseAmount(millimeters),
    inches: parseAmount(inches),
  });

  const activeMode = MODE_OPTIONS.find((option) => option.id === mode);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Conversion direction</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="mm-inches-mode"
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

        {mode === "mm_to_in" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Millimeters</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={millimeters}
              onChange={(event) => setMillimeters(event.target.value)}
              className="input-field"
              placeholder="25.4"
            />
            <span className="mt-2 block text-muted">
              Length in millimeters. 25.4 mm is exactly 1 inch. Must be 0 or more.
            </span>
          </label>
        ) : (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Inches</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={inches}
              onChange={(event) => setInches(event.target.value)}
              className="input-field"
              placeholder="1"
            />
            <span className="mt-2 block text-muted">
              Length in decimal inches. 1 inch is exactly 25.4 mm. Must be 0 or more.
            </span>
          </label>
        )}

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Conversion results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {mode === "mm_to_in" ? (
            <ResultRow
              label="Inches"
              value={
                result.valid && result.inches !== null
                  ? formatLength(result.inches, "in")
                  : "—"
              }
              emphasize
            />
          ) : (
            <ResultRow
              label="Millimeters"
              value={
                result.valid && result.millimeters !== null
                  ? formatLength(result.millimeters, "mm")
                  : "—"
              }
              emphasize
            />
          )}
          <ResultRow
            label="Nearest fraction"
            value={
              result.valid && result.fraction
                ? formatInchFraction(result.fraction)
                : "—"
            }
          />
          {mode === "mm_to_in" ? (
            <ResultRow
              label="Millimeters"
              value={
                result.valid && result.millimeters !== null
                  ? formatLength(result.millimeters, "mm")
                  : "—"
              }
            />
          ) : (
            <ResultRow
              label="Inches"
              value={
                result.valid && result.inches !== null
                  ? formatLength(result.inches, "in")
                  : "—"
              }
            />
          )}
          <ResultRow label="Exact formula" value="1 in = 25.4 mm" />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {mode === "mm_to_in"
              ? `${formatLength(result.millimeters ?? 0, "mm")} is ${formatLength(result.inches ?? 0, "in")} — nearest fraction ${result.fraction ? formatInchFraction(result.fraction) : "—"}.`
              : `${formatLength(result.inches ?? 0, "in")} is ${formatLength(result.millimeters ?? 0, "mm")} — nearest fraction ${result.fraction ? formatInchFraction(result.fraction) : "—"}.`}
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Uses the international inch (exactly 25.4 mm). Fractional inches are
            rounded to the nearest 1/64. Educational conversion, not a
            calibrated measurement.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter a millimeter or inch value of 0 or more. 1 inch equals 25.4 millimeters."}
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
        className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
