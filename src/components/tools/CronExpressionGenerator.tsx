"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  CRON_PRESETS,
  DEFAULT_CRON_FIELDS,
  applyCronPreset,
  buildCronExpression,
  describeCron,
  fieldsMatchPreset,
  nextCronRuns,
  parseCronExpression,
  type CronFieldName,
  type CronFields,
  type CronPresetId,
} from "@/lib/cron";

const FIELD_META: { key: CronFieldName; label: string; hint: string }[] = [
  { key: "minute", label: "Minute", hint: "0–59" },
  { key: "hour", label: "Hour", hint: "0–23" },
  { key: "dayOfMonth", label: "Day of month", hint: "1–31" },
  { key: "month", label: "Month", hint: "1–12 or JAN" },
  { key: "dayOfWeek", label: "Day of week", hint: "0–7 or SUN" },
];

const PRESET_IDS = Object.keys(CRON_PRESETS) as CronPresetId[];

function formatRun(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function CronExpressionGenerator() {
  const [fields, setFields] = useState<CronFields>(DEFAULT_CRON_FIELDS);
  const [draft, setDraft] = useState(buildCronExpression(DEFAULT_CRON_FIELDS));
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const expression = buildCronExpression(fields);
  const parsed = useMemo(() => parseCronExpression(expression), [expression]);
  const described = useMemo(() => describeCron(expression), [expression]);
  const upcoming = useMemo(
    () => (now ? nextCronRuns(expression, now, 5) : null),
    [expression, now],
  );

  const activePreset = PRESET_IDS.find((id) => fieldsMatchPreset(fields, id)) ?? null;
  const timeZone = now ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  function updateField(key: CronFieldName, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    setDraft(buildCronExpression(next));
  }

  function applyPreset(id: CronPresetId) {
    const next = applyCronPreset(id);
    setFields(next);
    setDraft(buildCronExpression(next));
  }

  function applyDraft() {
    const result = parseCronExpression(draft);
    if (!result.ok) return;
    setFields(result.fields);
    setDraft(result.expression);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <fieldset>
        <legend className="mb-2 block text-xs text-muted">Presets</legend>
        <div className="flex flex-wrap gap-2">
          {PRESET_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={`chip inline-flex hover:border-mint/40 ${
                activePreset === id ? "border-mint/60 bg-mint/10" : ""
              }`}
            >
              {CRON_PRESETS[id].label}
            </button>
          ))}
        </div>
      </fieldset>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          applyDraft();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-5">
          {FIELD_META.map((field) => (
            <label key={field.key} className="block text-sm" htmlFor={`cron-${field.key}`}>
              <span className="mb-2 block text-xs text-muted">{field.label}</span>
              <input
                id={`cron-${field.key}`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={fields[field.key]}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="input-field"
                placeholder="*"
              />
              <span className="mt-1 block text-[11px] text-muted">{field.hint}</span>
            </label>
          ))}
        </div>

        <label className="block text-sm" htmlFor="cron-expression">
          <span className="mb-2 block text-xs text-muted">Expression</span>
          <input
            id="cron-expression"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={applyDraft}
            className="input-field"
            placeholder="0 0 * * *"
          />
        </label>
      </form>

      {!parsed.ok ? (
        <p className="text-sm text-danger">{parsed.error}</p>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Generated expression</h2>
              <CopyButton value={parsed.expression} label="Copy" />
            </div>
            <p className="mt-3 overflow-x-auto rounded-[10px] bg-surface px-3 py-3 font-mono text-lg text-mint">
              {parsed.expression}
            </p>
            {described.ok ? (
              <p className="mt-3 text-sm leading-6 text-muted">{described.summary}</p>
            ) : null}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Next runs</h2>
            <p className="mt-1 text-xs text-muted">
              Preview in your local timezone{timeZone ? ` (${timeZone})` : ""}. Standard
              5-field cron, no seconds field.
            </p>
            {upcoming === null ? (
              <p className="mt-3 text-sm text-muted">Loading upcoming times…</p>
            ) : !upcoming.ok ? (
              <p className="mt-3 text-sm text-danger">{upcoming.error}</p>
            ) : upcoming.runs.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No matching times in the next two years. Check day-of-month and month
                together (for example, 31 April never runs).
              </p>
            ) : (
              <ol className="mt-3 divide-y divide-line rounded-[10px] bg-surface">
                {upcoming.runs.map((date) => (
                  <li key={date.getTime()} className="px-3 py-2 font-mono text-sm text-text">
                    {formatRun(date)}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
