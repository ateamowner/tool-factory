"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  UTM_PRESETS,
  applyNamingRules,
  buildUtmCsv,
  buildUtmUrl,
  parseCsv,
  rowsToUtmFields,
  type UtmFields,
  type UtmPresetId,
} from "@/lib/utm";

const emptyFields: UtmFields = {
  destination: "",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
  id: "",
};

export function UtmBuilder() {
  const [fields, setFields] = useState<UtmFields>(emptyFields);
  const [applyRules, setApplyRules] = useState(true);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");

  const preview = useMemo(
    () => buildUtmUrl(fields, { applyRules }),
    [fields, applyRules],
  );

  const bulkRows = useMemo(() => {
    if (!bulkText.trim()) return [];
    const parsed = parseCsv(bulkText);
    const source =
      parsed.headers.length > 0 && parsed.rows.length === 0
        ? rowsToUtmFields(
            ["destination", "source", "medium", "campaign", "term", "content", "id"],
            [parsed.headers],
          )
        : rowsToUtmFields(parsed.headers, parsed.rows);

    return source.map((row) => {
      const built = buildUtmUrl(row, { applyRules });
      return { ...row, final_url: built.url, error: built.error };
    });
  }, [bulkText, applyRules]);

  function setField<K extends keyof UtmFields>(key: K, value: UtmFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(id: UtmPresetId) {
    const preset = UTM_PRESETS[id];
    setFields((current) => ({
      ...current,
      source: applyRules ? applyNamingRules(preset.source) : preset.source,
      medium: applyRules ? applyNamingRules(preset.medium) : preset.medium,
    }));
  }

  function onUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setBulkText(text);
      setBulkError("");
    };
    reader.onerror = () => setBulkError("Could not read that file in the browser.");
    reader.readAsText(file);
  }

  function exportCsv() {
    const ready = bulkRows.filter((row) => row.final_url);
    if (ready.length === 0) return;
    const csv = buildUtmCsv(ready);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "utm-links.csv";
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-8">
      <form
        className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="sr-only">Presets</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(UTM_PRESETS) as UtmPresetId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className="chip inline-flex hover:border-mint/40"
              >
                {UTM_PRESETS[id].label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Destination URL</span>
          <input
            type="url"
            inputMode="url"
            autoComplete="url"
            value={fields.destination}
            onChange={(event) => setField("destination", event.target.value)}
            className="input-field"
            placeholder="https://example.com/landing"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="utm_source"
            value={fields.source ?? ""}
            onChange={(value) => setField("source", value)}
            placeholder="newsletter"
          />
          <TextField
            label="utm_medium"
            value={fields.medium ?? ""}
            onChange={(value) => setField("medium", value)}
            placeholder="email"
          />
          <TextField
            label="utm_campaign"
            value={fields.campaign ?? ""}
            onChange={(value) => setField("campaign", value)}
            placeholder="spring_launch"
          />
          <TextField
            label="utm_term (optional)"
            value={fields.term ?? ""}
            onChange={(value) => setField("term", value)}
            placeholder="running_shoes"
          />
          <TextField
            label="utm_content (optional)"
            value={fields.content ?? ""}
            onChange={(value) => setField("content", value)}
            placeholder="header_cta"
          />
          <TextField
            label="utm_id (optional)"
            value={fields.id ?? ""}
            onChange={(value) => setField("id", value)}
            placeholder="cmp_123"
          />
        </div>

        <div>
          <p className="mb-2 text-xs text-muted">Final URL</p>
          <p className="break-all font-mono text-sm text-mint">
            {preview.url || preview.error || "Enter a destination URL to preview."}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={applyRules}
              onChange={(event) => setApplyRules(event.target.checked)}
              className="mt-1 size-4 accent-mint"
            />
            <span>
              {applyRules
                ? "Naming rules on · lowercase + underscores"
                : "Naming rules off"}
            </span>
          </label>
          <CopyButton
            value={preview.url}
            label="Copy URL"
            disabled={!preview.url}
            showStatus
          />
        </div>
      </form>

      <section className="rounded-2xl border border-line bg-card p-4 sm:p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Bulk CSV
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Paste rows or upload a CSV. Use headers such as destination, source,
          medium, campaign, term, content, and id — or the utm_* names. Files
          are read locally and never uploaded.
        </p>
        <label className="mt-4 block text-sm">
          <span className="sr-only">CSV rows</span>
          <textarea
            value={bulkText}
            onChange={(event) => {
              setBulkText(event.target.value);
              setBulkError("");
            }}
            rows={6}
            className="input-field min-h-36"
            placeholder={"destination,source,medium,campaign\nhttps://example.com,google,cpc,brand"}
          />
        </label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Nothing uploaded</p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">
              <span className="sr-only">Upload CSV</span>
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={(event) => onUpload(event.target.files?.[0])}
                className="text-sm file:mr-3 file:rounded-full file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text"
              />
            </label>
            <button
              type="button"
              onClick={exportCsv}
              disabled={bulkRows.every((row) => !row.final_url)}
              className="btn-secondary"
            >
              Export CSV
            </button>
          </div>
        </div>
        {bulkError ? <p className="mt-2 text-sm text-danger">{bulkError}</p> : null}

        {bulkRows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Generated UTM URLs</caption>
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-3 font-medium">Destination</th>
                  <th className="py-2 pr-3 font-medium">Final URL</th>
                  <th className="py-2 font-medium">Copy</th>
                </tr>
              </thead>
              <tbody>
                {bulkRows.map((row, index) => (
                  <tr key={`${row.destination}-${index}`} className="border-b border-line/70 align-top">
                    <td className="py-2 pr-3">{row.destination || "—"}</td>
                    <td className="max-w-xl py-2 pr-3 break-all font-mono text-xs text-mint">
                      {row.final_url || row.error || "—"}
                    </td>
                    <td className="py-2">
                      <CopyButton
                        value={row.final_url}
                        label="Copy"
                        disabled={!row.final_url}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const id = label.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
    </label>
  );
}
