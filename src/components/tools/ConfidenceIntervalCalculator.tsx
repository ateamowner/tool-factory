"use client";

import { useState } from "react";
import { meanConfidenceInterval, proportionConfidenceInterval, type CiMethod } from "@/lib/confidence-interval";

const PRESETS = ["90", "95", "99"];

function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return "0";
  return String(Number(n.toFixed(digits)));
}

function pct(n: number): string {
  return `${fmt(n * 100, 2)}%`;
}

function num(raw: string): number {
  return raw.trim() === "" ? NaN : Number(raw);
}

export function ConfidenceIntervalCalculator() {
  const [mode, setMode] = useState<"mean" | "proportion">("mean");
  const [level, setLevel] = useState("95");
  const [mean, setMean] = useState("50");
  const [sd, setSd] = useState("10");
  const [n, setN] = useState("25");
  const [method, setMethod] = useState<CiMethod>("t");
  const [successes, setSuccesses] = useState("60");
  const [trials, setTrials] = useState("100");

  const mres = mode === "mean" ? meanConfidenceInterval({ mean: num(mean), sd: num(sd), n: num(n), levelPercent: num(level), method }) : null;
  const pres = mode === "proportion" ? proportionConfidenceInterval({ successes: num(successes), n: num(trials), levelPercent: num(level) }) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex flex-wrap gap-2" aria-label="Interval type">
          <button type="button" aria-pressed={mode === "mean"} onClick={() => setMode("mean")} className={`chip inline-flex ${mode === "mean" ? "border-mint text-mint" : ""}`}>
            Mean
          </button>
          <button type="button" aria-pressed={mode === "proportion"} onClick={() => setMode("proportion")} className={`chip inline-flex ${mode === "proportion" ? "border-mint text-mint" : ""}`}>
            Proportion
          </button>
        </fieldset>
        <fieldset className="flex flex-wrap items-center gap-2" aria-label="Confidence level">
          {PRESETS.map((p) => (
            <button key={p} type="button" aria-pressed={level === p} onClick={() => setLevel(p)} className={`chip inline-flex ${level === p ? "border-mint text-mint" : ""}`}>
              {p}%
            </button>
          ))}
          <label className="flex items-center gap-2 text-xs text-muted" htmlFor="ci-level">
            Custom %
            <input id="ci-level" inputMode="decimal" autoComplete="off" value={level} onChange={(e) => setLevel(e.target.value)} className="input-field w-24 font-mono" />
          </label>
        </fieldset>

        {mode === "mean" ? (
          <>
            <fieldset className="flex flex-wrap gap-2" aria-label="Method">
              <button type="button" aria-pressed={method === "t"} onClick={() => setMethod("t")} className={`chip inline-flex ${method === "t" ? "border-mint text-mint" : ""}`}>
                t interval (σ unknown)
              </button>
              <button type="button" aria-pressed={method === "z"} onClick={() => setMethod("z")} className={`chip inline-flex ${method === "z" ? "border-mint text-mint" : ""}`}>
                z interval (σ known)
              </button>
            </fieldset>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="ci-mean" label="Sample mean (x̄)" value={mean} onChange={setMean} />
              <Field id="ci-sd" label={method === "t" ? "Sample standard deviation (s)" : "Population standard deviation (σ)"} value={sd} onChange={setSd} />
              <Field id="ci-n" label="Sample size (n)" value={n} onChange={setN} />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Field id="ci-successes" label="Successes (x)" value={successes} onChange={setSuccesses} />
            <Field id="ci-trials" label="Sample size (n)" value={trials} onChange={setTrials} />
          </div>
        )}
        <p className="text-xs leading-5 text-muted">
          {mode === "mean"
            ? "Mean interval: x̄ ± critical value × s / √n. Use t when you only have the sample standard deviation, and z when the population standard deviation is known."
            : "Proportion interval: p̂ ± z × √(p̂(1 − p̂) / n). The Wilson interval is shown too because it behaves better for small samples and extreme proportions."}
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {mres && mres.valid ? (
          <>
            <p className="mt-3 text-xs text-muted">{fmt(num(level), 4)}% confidence interval</p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">
              ({fmt(mres.lower)}, {fmt(mres.upper)})
            </p>
            <dl className="mt-4 space-y-1 font-mono text-sm tabular-nums text-muted">
              <Row label="Margin of error" value={fmt(mres.margin)} />
              <Row label="Standard error" value={fmt(mres.standardError)} />
              <Row label={mres.method === "t" ? "Critical t" : "Critical z"} value={fmt(mres.critical)} />
              {mres.df !== null ? <Row label="Degrees of freedom" value={String(mres.df)} /> : null}
            </dl>
          </>
        ) : null}
        {pres && pres.valid ? (
          <>
            <p className="mt-3 text-xs text-muted">{fmt(num(level), 4)}% confidence interval</p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">
              ({pct(pres.lower)}, {pct(pres.upper)})
            </p>
            <dl className="mt-4 space-y-1 font-mono text-sm tabular-nums text-muted">
              <Row label="Sample proportion (p̂)" value={fmt(pres.phat)} />
              <Row label="Margin of error" value={pct(pres.margin)} />
              <Row label="Standard error" value={fmt(pres.standardError)} />
              <Row label="Critical z" value={fmt(pres.critical)} />
              <Row label="Wilson interval" value={`${pct(pres.wilsonLower)} to ${pct(pres.wilsonUpper)}`} />
            </dl>
          </>
        ) : null}
        {mres && !mres.valid ? <p className="mt-4 text-sm leading-6 text-muted">{mres.error}</p> : null}
        {pres && !pres.valid ? <p className="mt-4 text-sm leading-6 text-muted">{pres.error}</p> : null}
      </aside>
    </div>
  );
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input id={id} inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} className="input-field font-mono" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
