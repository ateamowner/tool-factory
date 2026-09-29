"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  MAX_PREVIEW_ROWS,
  convertCsvToExcel,
  excelFileNameFromCsvName,
  type CsvToExcelResult,
} from "@/lib/csv-to-excel";

const SAMPLE_CSV = `name,role,year
Ada Lovelace,Mathematician,1815
Grace Hopper,Computer scientist,1906
Alan Turing,Mathematician,1912
`;

function downloadXlsx(bytes: Uint8Array, fileName: string) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const blob = new Blob([copy], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CsvToExcelConverter() {
  const inputId = useId();
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("data.xlsx");
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState<CsvToExcelResult | null>(null);
  const [busy, setBusy] = useState(false);

  const idle = csvText.trim().length === 0;

  useEffect(() => {
    if (idle) {
      setResult(null);
      setBusy(false);
      return;
    }

    let cancelled = false;
    setBusy(true);
    const handle = window.setTimeout(() => {
      void convertCsvToExcel(csvText).then((next) => {
        if (!cancelled) {
          setResult(next);
          setBusy(false);
        }
      });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [csvText, idle]);

  const previewRows = useMemo(() => {
    if (!result?.ok) return [];
    return result.rows.slice(0, MAX_PREVIEW_ROWS + 1);
  }, [result]);

  async function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setFileError("");
    try {
      const text = await file.text();
      setCsvText(text);
      setFileName(excelFileNameFromCsvName(file.name));
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
        Paste CSV or open a local .csv file. The first row becomes the header
        row in Excel. Quoted commas and newlines are supported. Nothing is
        uploaded.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (result?.ok) downloadXlsx(result.bytes, fileName);
        }}
      >
        <label className="block text-sm" htmlFor={inputId}>
          <span className="mb-2 block text-xs text-muted">CSV</span>
          <textarea
            id={inputId}
            value={csvText}
            onChange={(event) => {
              setCsvText(event.target.value);
              setFileError("");
            }}
            rows={12}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[16rem] resize-y font-mono text-sm"
            placeholder={"Paste CSV — e.g.\nname,year\nAda,1815"}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="btn-primary"
            disabled={!result?.ok || busy}
          >
            Download Excel
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCsvText(SAMPLE_CSV);
              setFileName("sample.xlsx");
              setFileError("");
            }}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCsvText("");
              setFileName("data.xlsx");
              setFileError("");
            }}
            disabled={idle}
          >
            Clear
          </button>
          <label className="btn-secondary cursor-pointer" htmlFor={fileId}>
            Choose .csv
            <input
              id={fileId}
              ref={fileRef}
              type="file"
              accept=".csv,text/csv,application/csv,text/plain"
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files)}
            />
          </label>
        </div>
      </form>

      {fileError ? <p className="text-sm text-danger">{fileError}</p> : null}

      {idle ? (
        <p className="text-sm text-muted">
          Paste CSV or choose a file to see columns, a preview, and an Excel
          download.
        </p>
      ) : busy && !result ? (
        <p className="text-sm text-muted">Converting…</p>
      ) : result && !result.ok ? (
        <p className="text-sm text-danger" role="alert">
          {result.error}
        </p>
      ) : result?.ok ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Excel preview</h2>
            <p className="text-sm text-muted">{result.summary}</p>
          </div>
          <p className="text-sm text-muted">
            Columns:{" "}
            <span className="font-mono text-mint">
              {result.columns.join(", ")}
            </span>
          </p>
          <div className="max-h-[22rem] overflow-auto rounded-[10px] border border-line bg-surface">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  {result.columns.map((column) => (
                    <th
                      key={column}
                      className="sticky top-0 border-b border-line bg-surface px-3 py-2 font-semibold text-mint"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(1).map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="border-b border-line/60">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className="px-3 py-2 font-mono text-text/90 whitespace-pre-wrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.length > MAX_PREVIEW_ROWS + 1 ? (
            <p className="text-sm text-muted">
              Showing the first {MAX_PREVIEW_ROWS} data rows. The full table is
              in the .xlsx download.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
