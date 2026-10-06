"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { formatJson, type JsonIndent } from "@/lib/json-formatter";

const SAMPLE_JSON = `{"id":1042,"name":"Ada Lovelace","active":true,"roles":["admin","editor"],"address":{"city":"London","zip":"NW1"},"lastLogin":null,"score":98.6}`;

type Mode = "pretty" | "minify";

export function JsonFormatter() {
  const [json, setJson] = useState("");
  const [indent, setIndent] = useState<JsonIndent>(2);
  const [mode, setMode] = useState<Mode>("pretty");
  const [sortKeys, setSortKeys] = useState(false);
  const idle = json.trim().length === 0;

  const result = useMemo(
    () => (idle ? null : formatJson(json, { indent, minify: mode === "minify", sortKeys })),
    [json, indent, mode, sortKeys, idle],
  );

  const download = () => {
    if (!result || !result.ok) return;
    const blob = new Blob([result.output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        Strict JSON validation and pretty-print in this tab. Choose 2 spaces,
        4 spaces, or tabs, or minify to one line. Nothing is uploaded.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (result && result.ok) setJson(result.output);
        }}
      >
        <label className="block text-sm" htmlFor="json-input">
          <span className="mb-2 block text-xs text-muted">JSON</span>
          <textarea
            id="json-input"
            value={json}
            onChange={(event) => setJson(event.target.value)}
            rows={10}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[14rem] resize-y font-mono"
            placeholder='Paste JSON to format — for example {"name":"Ada","roles":["admin"]}'
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm" htmlFor="json-mode">
            <span className="mb-2 block text-xs text-muted">Output</span>
            <select
              id="json-mode"
              className="input-field"
              value={mode}
              onChange={(event) => setMode(event.target.value as Mode)}
            >
              <option value="pretty">Pretty-print</option>
              <option value="minify">Minify</option>
            </select>
          </label>
          <label className="block text-sm" htmlFor="json-indent">
            <span className="mb-2 block text-xs text-muted">Indent</span>
            <select
              id="json-indent"
              className="input-field"
              value={String(indent)}
              disabled={mode === "minify"}
              onChange={(event) => {
                const v = event.target.value;
                setIndent(v === "tab" ? "tab" : (Number(v) as JsonIndent));
              }}
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-3 text-sm" htmlFor="json-sort">
            <input
              id="json-sort"
              type="checkbox"
              checked={sortKeys}
              onChange={(event) => setSortKeys(event.target.checked)}
            />
            <span>Sort keys A–Z</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="btn-primary"
            disabled={idle || !result || !result.ok}
          >
            Format
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setJson(SAMPLE_JSON)}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setJson("")}
            disabled={idle}
          >
            Clear
          </button>
        </div>
      </form>

      {idle || !result ? (
        <p className="text-sm text-muted">
          Paste JSON to validate it, pretty-print it with indentation, then copy
          or download the result.
        </p>
      ) : result.ok ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Valid JSON</h2>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={result.output} label="Copy" />
              <button type="button" className="btn-secondary" onClick={download}>
                Download .json
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">
            Top level: {result.stats.type} · {result.stats.keys} keys · depth{" "}
            {result.stats.depth} · {result.stats.bytes.toLocaleString()} bytes
          </p>
          <pre className="mt-3 max-h-[32rem] overflow-auto rounded-[10px] bg-surface px-3 py-3 font-mono text-sm leading-6 text-mint">
            {result.output}
          </pre>
        </div>
      ) : (
        <div
          className="rounded-[10px] border border-line bg-surface px-3 py-3 text-sm leading-6"
          role="alert"
        >
          <p className="font-semibold">Invalid JSON</p>
          <p className="mt-1 text-muted">
            {result.line ? `Line ${result.line}, column ${result.column}: ` : ""}
            {result.error}
          </p>
        </div>
      )}
    </div>
  );
}
