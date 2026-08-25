"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { generateUuids, type UuidVersion } from "@/lib/uuid";

export function UuidGenerator() {
  const [version, setVersion] = useState<UuidVersion>(4);
  const [count, setCount] = useState("1");
  const [ids, setIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  function generate() {
    const parsed = Number(count);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setError("Enter a count of at least 1.");
      return;
    }
    if (parsed > 1000) {
      setError("Bulk generate up to 1,000 IDs at a time.");
      return;
    }
    setError("");
    setIds(generateUuids(version, parsed));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-5">
      <form
        className="grid gap-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <fieldset>
          <legend className="mb-1 block text-sm font-medium">Version</legend>
          <div className="flex gap-2">
            <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-sm has-checked:border-accent has-checked:bg-accent-soft">
              <input
                type="radio"
                name="uuid-version"
                value="4"
                checked={version === 4}
                onChange={() => setVersion(4)}
                className="accent-accent"
              />
              UUID v4
            </label>
            <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-sm has-checked:border-accent has-checked:bg-accent-soft">
              <input
                type="radio"
                name="uuid-version"
                value="7"
                checked={version === 7}
                onChange={() => setVersion(7)}
                className="accent-accent"
              />
              UUID v7
            </label>
          </div>
        </fieldset>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">How many</span>
          <input
            type="number"
            min={1}
            max={1000}
            inputMode="numeric"
            value={count}
            onChange={(event) => setCount(event.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Generate
        </button>
      </form>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {ids.length > 0 ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {ids.length === 1 ? "Generated ID" : `${ids.length} generated IDs`}
            </h2>
            <CopyButton value={ids.join("\n")} label="Copy all" />
          </div>
          <ul className="mt-3 space-y-2">
            {ids.map((id) => (
              <li
                key={id}
                className="flex flex-col gap-2 rounded-xl bg-canvas px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <code className="break-all text-sm">{id}</code>
                <CopyButton value={id} label="Copy" className="shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Choose UUID v4 or v7, set a count, then generate. This online GUID
          generator uses Web Crypto in your browser.
        </p>
      )}
    </div>
  );
}
