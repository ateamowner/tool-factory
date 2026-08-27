"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  DECODE_ERROR,
  MAX_HEIC_FILES,
  TOO_MANY_FILES_ERROR,
  formatFileSize,
  heicValidationError,
  pngFileNameFromHeic,
} from "@/lib/heic-to-png";

type RowStatus = "converting" | "done" | "error";

type ConversionRow = {
  id: string;
  fileName: string;
  pngName: string;
  status: RowStatus;
  error: string;
  url: string | null;
  sizeLabel: string;
};

function downloadUrl(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
}

async function bitmapToPngBlob(bitmap: ImageBitmap): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error(DECODE_ERROR);
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) throw new Error(DECODE_ERROR);
  return blob;
}

async function convertHeicFileToPng(file: File): Promise<Blob> {
  const header = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const invalid = heicValidationError(file, header);
  if (invalid) throw new Error(invalid);

  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width < 1 || bitmap.height < 1) {
      bitmap.close();
      throw new Error(DECODE_ERROR);
    }
    return await bitmapToPngBlob(bitmap);
  } catch (error) {
    if (error instanceof Error && error.message === DECODE_ERROR) throw error;
    // Native decode is unavailable in many Chromium builds; fall through to WASM.
  }

  try {
    const { heicTo } = await import("heic-to");
    return await heicTo({ blob: file, type: "image/png" });
  } catch {
    throw new Error(DECODE_ERROR);
  }
}

export function HeicToPngConverter() {
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
    if (files.length > MAX_HEIC_FILES) {
      setFormError(TOO_MANY_FILES_ERROR);
      return;
    }

    setFormError("");
    setBusy(true);
    replaceRows(
      files.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}`,
        fileName: file.name,
        pngName: pngFileNameFromHeic(file.name),
        status: "converting",
        error: "",
        url: null,
        sizeLabel: formatFileSize(file.size),
      })),
    );

    const nextRows: ConversionRow[] = [];
    for (const [index, file] of files.entries()) {
      const id = `${file.name}-${file.size}-${index}`;
      const pngName = pngFileNameFromHeic(file.name);
      try {
        const blob = await convertHeicFileToPng(file);
        nextRows.push({
          id,
          fileName: file.name,
          pngName,
          status: "done",
          error: "",
          url: URL.createObjectURL(blob),
          sizeLabel: formatFileSize(blob.size),
        });
      } catch (error) {
        nextRows.push({
          id,
          fileName: file.name,
          pngName,
          status: "error",
          error: error instanceof Error ? error.message : DECODE_ERROR,
          url: null,
          sizeLabel: formatFileSize(file.size),
        });
      }
      const pending = files.slice(nextRows.length).map((rest, offset) => ({
        id: `${rest.name}-${rest.size}-${nextRows.length + offset}`,
        fileName: rest.name,
        pngName: pngFileNameFromHeic(rest.name),
        status: "converting" as const,
        error: "",
        url: null,
        sizeLabel: formatFileSize(rest.size),
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
          Select one or more .heic or .heif files. Conversion runs in this tab —
          photos are not uploaded.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <label htmlFor={inputId} className="btn-primary cursor-pointer">
            Choose HEIC files
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept=".heic,.heif,.HEIC,.HEIF,image/heic,image/heif"
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
          PNG downloads appear here after you pick files. Use Safari or a recent
          Chromium build if a photo will not decode.
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
                    if (row.url) downloadUrl(row.url, row.pngName);
                  }
                }}
              >
                Download all PNGs
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
                        ? `${row.pngName} · ${row.sizeLabel}`
                        : row.error}
                  </p>
                </div>
                {row.status === "done" && row.url ? (
                  <div className="flex shrink-0 items-center gap-3">
                    {/* Preview of the local PNG blob; next/image is for remote assets. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.url}
                      alt={`PNG preview of ${row.fileName}`}
                      className="size-12 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => downloadUrl(row.url!, row.pngName)}
                    >
                      Download PNG
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
