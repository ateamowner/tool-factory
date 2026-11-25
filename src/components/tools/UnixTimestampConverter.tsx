"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  formatDateInput,
  formatTimeInput,
  nowUnix,
  parseDateTimeInputs,
  unixToDate,
  type TimeZoneMode,
  type UnixResult,
  type UnixUnit,
} from "@/lib/unix-timestamp";

const UNITS: { id: UnixUnit; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "seconds", label: "Seconds" },
  { id: "milliseconds", label: "Milliseconds" },
];

function ResultRows({ result }: { result: UnixResult }) {
  if (!result.ok) {
    return <p className="text-sm text-danger">{result.error}</p>;
  }

  const rows = [
    ["UTC", result.utc],
    ["Local", result.local],
    ["ISO 8601", result.iso],
    ["RFC 2822", result.rfc],
    ["Seconds", String(result.integerSeconds)],
    ["Milliseconds", String(result.milliseconds)],
  ] as const;

  return (
    <dl className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="break-all font-mono text-sm text-text">{value}</dd>
          </div>
          <CopyButton value={value} label="Copy" variant="secondary" />
        </div>
      ))}
    </dl>
  );
}

export function UnixTimestampConverter() {
  const [now, setNow] = useState<ReturnType<typeof nowUnix> | null>(null);
  const [unixInput, setUnixInput] = useState("");
  const [unit, setUnit] = useState<UnixUnit>("auto");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [zone, setZone] = useState<TimeZoneMode>("utc");

  useEffect(() => {
    const tick = () => setNow(nowUnix());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);

  const unixResult = unixInput.trim() ? unixToDate(unixInput, unit) : null;
  const dateResult =
    dateInput || timeInput ? parseDateTimeInputs(dateInput, timeInput || "00:00:00", zone) : null;

  function useNowInDateForm() {
    const instant = nowUnix();
    setDateInput(formatDateInput(new Date(instant.milliseconds), zone));
    setTimeInput(formatTimeInput(new Date(instant.milliseconds), zone));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        <h2 className="text-lg font-semibold">Current Unix time</h2>
        {now ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted">Seconds</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                {now.integerSeconds}
              </p>
              <div className="mt-2">
                <CopyButton value={String(now.integerSeconds)} label="Copy seconds" variant="secondary" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Milliseconds</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                {now.milliseconds}
              </p>
              <div className="mt-2">
                <CopyButton value={String(now.milliseconds)} label="Copy milliseconds" variant="secondary" />
              </div>
            </div>
            <p className="text-sm text-muted sm:col-span-2">
              <span className="font-medium text-text">UTC:</span> {now.utc}
              <span className="mx-2 text-muted">·</span>
              <span className="font-medium text-text">Local:</span> {now.local}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Loading the current timestamp…</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <h2 className="text-lg font-semibold">Unix time to date</h2>
          <label className="block text-sm" htmlFor="unix-input">
            <span className="mb-2 block text-xs text-muted">Unix timestamp</span>
            <input
              id="unix-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={unixInput}
              onChange={(event) => setUnixInput(event.target.value)}
              className="input-field font-mono"
              placeholder="e.g. 1609459200"
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-xs text-muted">Unit</legend>
            <div className="flex flex-wrap gap-2">
              {UNITS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="chip"
                  aria-pressed={unit === option.id}
                  onClick={() => setUnit(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!now) return;
                setUnit("seconds");
                setUnixInput(String(now.integerSeconds));
              }}
              disabled={!now}
            >
              Use current seconds
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setUnixInput("")}
              disabled={!unixInput}
            >
              Clear
            </button>
          </div>
          <div className="border-t border-line pt-4" aria-live="polite">
            {unixResult ? (
              <ResultRows result={unixResult} />
            ) : (
              <p className="text-sm text-muted">
                Paste a timestamp in seconds or milliseconds. Auto picks milliseconds for 13-digit values.
              </p>
            )}
          </div>
        </form>

        <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <h2 className="text-lg font-semibold">Date to Unix time</h2>
          <label className="block text-sm" htmlFor="unix-date">
            <span className="mb-2 block text-xs text-muted">Date</span>
            <input
              id="unix-date"
              type="date"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
              className="input-field"
            />
          </label>
          <label className="block text-sm" htmlFor="unix-time">
            <span className="mb-2 block text-xs text-muted">Time</span>
            <input
              id="unix-time"
              type="time"
              step="1"
              value={timeInput}
              onChange={(event) => setTimeInput(event.target.value)}
              className="input-field"
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-xs text-muted">Interpret as</legend>
            <div className="flex flex-wrap gap-2">
              {([
                ["utc", "UTC"],
                ["local", "Local time"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="chip"
                  aria-pressed={zone === id}
                  onClick={() => setZone(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={useNowInDateForm}>
              Use now
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDateInput("");
                setTimeInput("");
              }}
              disabled={!dateInput && !timeInput}
            >
              Clear
            </button>
          </div>
          <div className="border-t border-line pt-4" aria-live="polite">
            {dateResult ? (
              <ResultRows result={dateResult} />
            ) : (
              <p className="text-sm text-muted">
                Pick a date and time in UTC or your local timezone to get seconds and milliseconds.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
