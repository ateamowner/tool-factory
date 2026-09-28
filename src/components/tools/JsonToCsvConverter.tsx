"use client";

import { useId, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  convertJsonToCsv,
  csvFileNameFromJsonName,
} from "@/lib/json-to-csv";

const SAMPLE_JSON = `[
  { "name": "Ada Lovelace", "role": "Mathematician", "year": 1815 },
  { "name": "Grace Hopper", "role": "Computer scientist", "year": 1906 },
  { "name": "Alan Turing", "role": "Mathematician", "year": 1912 }
]`;

function downloadCsv(csv: string, fileName: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function JsonToCsvConverter() {
  const inputId = useId();
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState("data.csv");
  const [fileError, setFileError] = useState("");

  const result = useMemo(() => convertJsonToCsv(jsonText), [jsonText]);
  const idle = jsonText.trim().length === 0;

  async function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setFileError("");
    try {
      const text = await file.text();
      setJsonText(text);
      setFileName(csvFileNameFromJsonName(file.name));
    } catch {
      setFileError("Could not read that file in this browser.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        Paste JSON or open a local .json file. Arrays of objects, a single
        object, and arrays of arrays become CSV in this tab. Nested values are
        stringified into cells. Nothing is uploaded.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (result.ok) downloadCsv(result.csv, fileName);
        }}
      >
        <label className="block text-sm" htmlFor={inputId}>
          <span className="mb-2 block text-xs text-muted">JSON</span>
          <textarea
            id={inputId}
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              setFileError("");
            }}
            rows={12}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[16rem] resize-y font-mono text-sm"
            placeholder='Paste JSON — e.g. [{"name":"Ada","year":1815}]'
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary" disabled={!result.ok}>
            Download CSV
          </button>
          <CopyButton
            value={result.ok ? result.csv : ""}
            label="Copy CSV"
            disabled={!result.ok}
            variant="secondary"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setJsonText(SAMPLE_JSON);
              setFileName("sample.csv");
              setFileError("");
            }}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setJsonText("");
              setFileName("data.csv");
              setFileError("");
            }}
            disabled={idle}
          >
            Clear
          </button>
          <label className="btn-secondary cursor-pointer" htmlFor={fileId}>
            Choose .json
            <input
              id={fileId}
              ref={fileRef}
              type="file"
              accept=".json,application/json,text/json"
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files)}
            />
          </label>
        </div>
      </form>

      {fileError ? <p className="text-sm text-danger">{fileError}</p> : null}

      {idle ? (
        <p className="text-sm text-muted">
          Paste JSON or choose a file to see CSV columns, a preview, and
          download.
        </p>
      ) : !result.ok ? (
        <p className="text-sm text-danger" role="alert">
          {result.error}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">CSV preview</h2>
            <p className="text-sm text-muted">{result.summary}</p>
          </div>
          <p className="text-sm text-muted">
            Columns:{" "}
            <span className="font-mono text-mint">
              {result.columns.join(", ")}
            </span>
          </p>
          <pre className="max-h-[22rem] overflow-auto rounded-[10px] bg-surface px-3 py-3 font-mono text-sm leading-6 text-mint whitespace-pre">
            {result.csv}
          </pre>
        </div>
      )}
    </div>
  );
}
