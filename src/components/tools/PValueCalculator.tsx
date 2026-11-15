"use client";

import { useState } from "react";
import { pValue, type Tail, type TestType } from "@/lib/pvalue";

const TESTS: { test: TestType; label: string }[] = [
  { test: "z", label: "Z-test" },
  { test: "t", label: "T-test" },
  { test: "chi", label: "Chi-square" },
];

const TAILS: { tail: Tail; label: string }[] = [
  { tail: "two", label: "Two-tailed" },
  { tail: "right", label: "Right-tailed" },
  { tail: "left", label: "Left-tailed" },
];

export function PValueCalculator() {
  const [test, setTest] = useState<TestType>("z");
  const [tail, setTail] = useState<Tail>("two");
  const [stat, setStat] = useState("1.96");
  const [df, setDf] = useState("10");
  const [alpha, setAlpha] = useState("0.05");

  const result = pValue(test, stat, df, tail, alpha);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex flex-wrap gap-2" aria-label="Test type">
          {TESTS.map((t) => (
            <button
              key={t.test}
              type="button"
              aria-pressed={test === t.test}
              onClick={() => {
                setTest(t.test);
                if (t.test === "chi" && tail === "two") setTail("right");
              }}
              className={`chip inline-flex ${test === t.test ? "border-mint text-mint" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </fieldset>

        <fieldset className="flex flex-wrap gap-2" aria-label="Tail">
          {TAILS.map((t) => (
            <button
              key={t.tail}
              type="button"
              aria-pressed={tail === t.tail}
              onClick={() => setTail(t.tail)}
              className={`chip inline-flex ${tail === t.tail ? "border-mint text-mint" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm" htmlFor="pv-stat">
            <span className="mb-2 block text-xs text-muted">
              {test === "z" ? "Z score" : test === "t" ? "T score" : "Chi-square statistic"}
            </span>
            <input id="pv-stat" type="text" inputMode="decimal" autoComplete="off" value={stat} onChange={(e) => setStat(e.target.value)} className="input-field" />
          </label>
          {test !== "z" && (
            <label className="block text-sm" htmlFor="pv-df">
              <span className="mb-2 block text-xs text-muted">Degrees of freedom</span>
              <input id="pv-df" type="text" inputMode="decimal" autoComplete="off" value={df} onChange={(e) => setDf(e.target.value)} className="input-field" />
            </label>
          )}
          <label className="block text-sm" htmlFor="pv-alpha">
            <span className="mb-2 block text-xs text-muted">Significance level (alpha)</span>
            <input id="pv-alpha" type="text" inputMode="decimal" autoComplete="off" value={alpha} onChange={(e) => setAlpha(e.target.value)} className="input-field" />
          </label>
        </div>
        <fieldset className="flex flex-wrap gap-2" aria-label="Alpha presets">
          {["0.10", "0.05", "0.01"].map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={Number(alpha) === Number(a)}
              onClick={() => setAlpha(a)}
              className={`chip inline-flex ${Number(alpha) === Number(a) ? "border-mint text-mint" : ""}`}
            >
              α = {a}
            </button>
          ))}
        </fieldset>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <>
            <p className="mt-3 text-xs text-muted">P-value</p>
            <p className="break-all font-mono text-2xl font-semibold tabular-nums text-mint">{result.pText}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Significant?" value={result.significant ? "Yes, p < α" : "No, p ≥ α"} />
              <Row label="Alpha" value={String(result.alpha)} />
              <Row label="Rejection region" value={result.critical} />
              <Row label="Test" value={result.description} />
            </dl>
            <p className="mt-4 text-sm leading-6 text-muted">{result.decision}</p>
          </>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-mono font-medium tabular-nums">{value}</dd>
    </div>
  );
}
