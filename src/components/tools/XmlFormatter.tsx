"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { formatXml, type XmlIndent } from "@/lib/xml-formatter";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101" lang="en"><title>XML Basics</title><author>Ada Lovelace</author><price currency="USD">29.95</price></book><book id="bk102"><title>Parsing Data</title><author>Grace Hopper</author><price currency="USD">34.50</price></book><!-- more books soon --></catalog>`;

type Mode = "pretty" | "minify";

export function XmlFormatter() {
  const [xml, setXml] = useState("");
  const [indent, setIndent] = useState<XmlIndent>(2);
  const [mode, setMode] = useState<Mode>("pretty");
  const idle = xml.trim().length === 0;

  const result = useMemo(
    () => (idle ? null : formatXml(xml, { indent, minify: mode === "minify" })),
    [xml, indent, mode, idle],
  );

  const download = () => {
    if (!result || !result.ok) return;
    const blob = new Blob([result.output], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        Well-formedness check and pretty-print in this tab, with line and column
        numbers for every error. Choose 2 spaces, 4 spaces, or tabs, or minify.
        Nothing is uploaded.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (result && result.ok) setXml(result.output);
        }}
      >
        <label className="block text-sm" htmlFor="xml-input">
          <span className="mb-2 block text-xs text-muted">XML</span>
          <textarea
            id="xml-input"
            value={xml}
            onChange={(event) => setXml(event.target.value)}
            rows={10}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[14rem] resize-y font-mono"
            placeholder="Paste XML to format — for example <note><to>Ada</to></note>"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm" htmlFor="xml-mode">
            <span className="mb-2 block text-xs text-muted">Output</span>
            <select
              id="xml-mode"
              className="input-field"
              value={mode}
              onChange={(event) => setMode(event.target.value as Mode)}
            >
              <option value="pretty">Pretty-print</option>
              <option value="minify">Minify</option>
            </select>
          </label>
          <label className="block text-sm" htmlFor="xml-indent">
            <span className="mb-2 block text-xs text-muted">Indent</span>
            <select
              id="xml-indent"
              className="input-field"
              value={String(indent)}
              disabled={mode === "minify"}
              onChange={(event) => {
                const v = event.target.value;
                setIndent(v === "tab" ? "tab" : (Number(v) as XmlIndent));
              }}
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
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
            onClick={() => setXml(SAMPLE_XML)}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setXml("")}
            disabled={idle}
          >
            Clear
          </button>
        </div>
      </form>

      {idle || !result ? (
        <p className="text-sm text-muted">
          Paste XML to validate it, pretty-print it with indentation, then copy or
          download the result.
        </p>
      ) : result.ok ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Valid XML</h2>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={result.output} label="Copy" />
              <button type="button" className="btn-secondary" onClick={download}>
                Download .xml
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">
            {result.stats.elements} elements · {result.stats.attributes} attributes · depth{" "}
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
          <p className="font-semibold">Invalid XML</p>
          <p className="mt-1 text-muted">
            {result.line ? `Line ${result.line}, column ${result.column}: ` : ""}
            {result.error}
          </p>
        </div>
      )}
    </div>
  );
}
