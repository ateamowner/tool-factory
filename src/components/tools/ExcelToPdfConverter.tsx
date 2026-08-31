"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  MAX_EXCEL_FILES,
  PARSE_ERROR,
  TOO_MANY_FILES_ERROR,
  excelValidationError,
  parseExcelBytes,
  pdfFileNameFromExcel,
  sheetsToPdf,
} from "@/lib/excel-to-pdf";
import { formatFileSize } from "@/lib/heic-to-png";

type RowStatus = "converting" | "done" | "error";

type ConversionRow = {
  id: string;
  fileName: string;
  pdfName: string;
  status: RowStatus;
  error: string;
  url: string | null;
  sizeLabel: string;
  detail: string;
};

function downloadUrl(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
}

async function convertExcelFileToPdf(file: File): Promise<{ pdf: Blob; detail: string }> {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const invalid = excelValidationError(file, header);
  if (invalid) throw new Error(invalid);

  let sheets;
  try {
    sheets = await parseExcelBytes(new Uint8Array(await file.arrayBuffer()));
  } catch (error) {
    if (error instanceof Error && error.message) throw error;
    throw new Error(PARSE_ERROR);
  }

  const pdfBytes = sheetsToPdf(sheets);
  const pdfCopy = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfCopy).set(pdfBytes);
  const sheetLabel = sheets.length === 1 ? "1 sheet" : `${sheets.length} sheets`;
  const rowCount = sheets.reduce((sum, sheet) => sum + sheet.rows.length, 0);
  return {
    pdf: new Blob([pdfCopy], { type: "application/pdf" }),
    detail: `${sheetLabel} · ${rowCount} rows`,
  };
}

export function ExcelToPdfConverter() {
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);
  const [rows, setRows] = useState<ConversionRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    return () => {
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
    };
  }, []);

  function replaceRows(next: ConversionRow[]) {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = next.flatMap((row) => (row.url ? [row.url] : []));
    setRows(next);
  }

  async function convertFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    if (files.length > MAX_EXCEL_FILES) {
      setFormError(TOO_MANY_FILES_ERROR);
      return;
    }

    setFormError("");
    setBusy(true);
    replaceRows(
      files.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}`,
        fileName: file.name,
        pdfName: pdfFileNameFromExcel(file.name),
        status: "converting",
        error: "",
        url: null,
        sizeLabel: formatFileSize(file.size),
        detail: "",
      })),
    );

    const nextRows: ConversionRow[] = [];
    for (const [index, file] of files.entries()) {
      const id = `${file.name}-${file.size}-${index}`;
      const pdfName = pdfFileNameFromExcel(file.name);
      try {
        const { pdf, detail } = await convertExcelFileToPdf(file);
        nextRows.push({
          id,
          fileName: file.name,
          pdfName,
          status: "done",
          error: "",
          url: URL.createObjectURL(pdf),
          sizeLabel: formatFileSize(pdf.size),
          detail,
        });
      } catch (error) {
        nextRows.push({
          id,
          fileName: file.name,
          pdfName,
          status: "error",
          error: error instanceof Error ? error.message : PARSE_ERROR,
          url: null,
          sizeLabel: formatFileSize(file.size),
          detail: "",
        });
      }
      const pending = files.slice(nextRows.length).map((rest, offset) => ({
        id: `${rest.name}-${rest.size}-${nextRows.length + offset}`,
        fileName: rest.name,
        pdfName: pdfFileNameFromExcel(rest.name),
        status: "converting" as const,
        error: "",
        url: null,
        sizeLabel: formatFileSize(rest.size),
        detail: "",
      }));
      urlsRef.current = nextRows.flatMap((row) => (row.url ? [row.url] : []));
      setRows([...nextRows, ...pending]);
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const doneRows = rows.filter((row) => row.status === "done" && row.url);
  const errorCount = rows.filter((row) => row.status === "error").length;

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <div
        className={`rounded-2xl border border-dashed px-4 py-8 text-center sm:px-6 ${
          dragOver ? "border-mint/60 bg-mint/5" : "border-line"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void convertFiles(event.dataTransfer.files);
        }}
      >
        <p className="text-sm text-muted">
          Select one or more .xlsx or .xls files. Conversion runs in this tab —
          spreadsheets are not uploaded.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <label htmlFor={inputId} className="btn-primary cursor-pointer">
            Choose Excel files
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.XLSX,.XLS,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void convertFiles(event.target.files);
            }}
          />
        </div>
      </div>

      <div id={statusId} aria-live="polite" className="min-h-5 text-sm">
        {formError ? <p className="text-danger">{formError}</p> : null}
        {busy ? <p className="text-muted">Converting in your browser…</p> : null}
        {!busy && rows.length > 0 && errorCount > 0 ? (
          <p className="text-danger">
            {errorCount === 1
              ? "1 file could not be converted."
              : `${errorCount} files could not be converted.`}
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          PDF downloads appear here after you pick files. Each workbook becomes
          one PDF, with a page sequence per sheet.
        </p>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {rows.length === 1 ? "Conversion" : `${rows.length} files`}
            </h2>
            {doneRows.length > 1 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  for (const row of doneRows) {
                    if (row.url) downloadUrl(row.url, row.pdfName);
                  }
                }}
              >
                Download all PDFs
              </button>
            ) : null}
          </div>
          <ul className="mt-3 space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-[10px] bg-surface px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{row.fileName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {row.status === "converting"
                      ? "Converting…"
                      : row.status === "done"
                        ? `${row.pdfName} · ${row.detail} · ${row.sizeLabel}`
                        : row.error}
                  </p>
                </div>
                {row.status === "done" && row.url ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => downloadUrl(row.url!, row.pdfName)}
                    >
                      Download PDF
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
