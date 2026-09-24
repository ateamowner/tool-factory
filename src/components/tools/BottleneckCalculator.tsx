"use client";

import { useState } from "react";
import { computeBottleneck, parseBottleneckCapacity } from "@/lib/bottleneck";

type StepDraft = {
  id: string;
  name: string;
  capacity: string;
};

function newStep(id: string, name = "", capacity = ""): StepDraft {
  return { id, name, capacity };
}

const SAMPLE_STEPS: StepDraft[] = [
  newStep("step-1", "Mixing", "120"),
  newStep("step-2", "Assembly", "80"),
  newStep("step-3", "Inspection", "100"),
  newStep("step-4", "Packing", "90"),
];

function unitsLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}%`;
}

export function BottleneckCalculator() {
  const [steps, setSteps] = useState<StepDraft[]>(SAMPLE_STEPS);
  const [nextId, setNextId] = useState(5);
  const [period, setPeriod] = useState("hour");

  const activeSteps = steps.filter(
    (step) => step.name.trim() !== "" || step.capacity.trim() !== "",
  );

  const result = computeBottleneck(
    activeSteps.map((step) => ({
      name: step.name,
      capacity: parseBottleneckCapacity(step.capacity),
    })),
  );

  const periodLabel = period.trim() || "period";
  const unitPhrase = `units per ${periodLabel}`;

  function updateStep(id: string, field: "name" | "capacity", value: string) {
    setSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, [field]: value } : step)),
    );
  }

  function removeStep(id: string) {
    if (steps.length === 1) {
      setSteps([newStep(`step-${nextId}`)]);
      setNextId((value) => value + 1);
      return;
    }
    setSteps((current) => current.filter((step) => step.id !== id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Process steps</h2>
            <p className="mt-1 text-sm text-muted">
              Capacity is how many units the step can finish in one {periodLabel}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSteps((current) => [...current, newStep(`step-${nextId}`)]);
              setNextId((value) => value + 1);
            }}
            className="btn-primary"
          >
            Add step
          </button>
        </div>

        <label className="block max-w-xs text-sm">
          <span className="mb-2 block text-xs text-muted">Time period</span>
          <input
            type="text"
            autoComplete="off"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="input-field"
            placeholder="hour"
            aria-label="Time period"
          />
        </label>

        <ol className="space-y-3">
          {steps.map((step, index) => {
            const activeIndex = activeSteps.findIndex((item) => item.id === step.id);
            const computed = activeIndex >= 0 ? result.steps[activeIndex] : undefined;

            return (
              <li key={step.id} className="rounded-2xl border border-line bg-card p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    Step {index + 1}
                    {computed?.isBottleneck ? (
                      <span className="ml-2 inline-flex rounded-full bg-mint/15 px-2 py-0.5 text-xs font-semibold text-mint">
                        Bottleneck
                      </span>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="text-sm font-medium text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Step name</span>
                    <input
                      type="text"
                      autoComplete="off"
                      value={step.name}
                      onChange={(event) => updateStep(step.id, "name", event.target.value)}
                      className="input-field"
                      placeholder="Assembly"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">
                      Capacity ({unitPhrase})
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={step.capacity}
                      onChange={(event) => updateStep(step.id, "capacity", event.target.value)}
                      className="input-field"
                      placeholder="80"
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no account.
        </p>
      </div>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Bottleneck results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted">Bottleneck</dt>
            <dd className="text-right font-medium text-mint">
              {result.valid ? result.bottleneckNames.join(", ") : "—"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted">System throughput</dt>
            <dd className="text-right font-mono text-lg font-semibold tabular-nums text-mint">
              {result.valid ? `${unitsLabel(result.throughput)} ${unitPhrase}` : "—"}
            </dd>
          </div>
        </dl>

        {result.valid ? (
          <ul className="mt-5 space-y-4 border-t border-line pt-4">
            {result.steps.map((step) => (
              <li key={`${step.index}-${step.name}`}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">
                    {step.name}
                    {step.isBottleneck ? (
                      <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-mint">
                        Constraint
                      </span>
                    ) : null}
                  </span>
                  <span className="font-mono tabular-nums">{percent(step.utilizationPercent)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-mint"
                    style={{ width: `${Math.min(100, Math.max(0, step.utilizationPercent))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {unitsLabel(step.capacity)} {unitPhrase}
                  {step.idleCapacity > 1e-9
                    ? ` · idle ${unitsLabel(step.idleCapacity)}`
                    : " · fully used"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Throughput equals the lowest capacity. Utilization is that throughput
            divided by each step&apos;s capacity.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
