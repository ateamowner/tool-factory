"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  JPEG_QUALITY,
  jpegBytesToPdf,
  pdfFileNameFromHeic,
  readJpegSize,
} from "@/lib/heic-to-pdf";
import {
  DECODE_ERROR,
  MAX_HEIC_FILES,
  TOO_MANY_FILES_ERROR,
  formatFileSize,
  heicValidationError,
} from "@/lib/heic-to-png";

type RowStatus = "converting" | "done" | "error";

type ConversionRow = {
  id: string;
  fileName: string;
  pdfName: string;
  status: RowStatus;
  error: string;
  url: string | null;
  previewUrl: string | null;
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

async function bitmapToJpeg(bitmap: ImageBitmap): Promise<{ blob: Blob; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error(DECODE_ERROR);
  }
  context.drawImage(bitmap, 0, 0);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
  if (!blob) throw new Error(DECODE_ERROR);
  return { blob, width, height };
}

async function convertHeicFileToPdf(file: File): Promise<{ pdf: Blob; preview: Blob }> {
  const header = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const invalid = heicValidationError(file, header);
  if (invalid) throw new Error(invalid);

  let jpeg: Blob | null = null;
  let width = 0;
  let height = 0;

  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width < 1 || bitmap.height < 1) {
      bitmap.close();
      throw new Error(DECODE_ERROR);
    }
    const decoded = await bitmapToJpeg(bitmap);
    jpeg = decoded.blob;
    width = decoded.width;
    height = decoded.height;
  } catch (error) {
    if (error instanceof Error && error.message === DECODE_ERROR) throw error;
    // Native decode is unavailable in many Chromium builds; fall through to WASM.
  }

  if (!jpeg) {
    try {
      const { heicTo } = await import("heic-to");
      jpeg = await heicTo({ blob: file, type: "image/jpeg", quality: JPEG_QUALITY });
      const size = readJpegSize(new Uint8Array(await jpeg.arrayBuffer()));
      if (!size) throw new Error(DECODE_ERROR);
      width = size.width;
      height = size.height;
    } catch {
      throw new Error(DECODE_ERROR);
    }
  }

  const jpegBytes = new Uint8Array(await jpeg.arrayBuffer());
  const pdfBytes = jpegBytesToPdf(jpegBytes, width, height);
  const pdfCopy = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfCopy).set(pdfBytes);
  return {
    pdf: new Blob([pdfCopy], { type: "application/pdf" }),
    preview: jpeg,
  };
}

export function HeicToPdfConverter() {
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

  function collectUrls(next: ConversionRow[]) {
    return next.flatMap((row) => [row.url, row.previewUrl].filter((url): url is string => Boolean(url)));
  }

  function replaceRows(next: ConversionRow[]) {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = collectUrls(next);
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
        pdfName: pdfFileNameFromHeic(file.name),
        status: "converting",
        error: "",
        url: null,
        previewUrl: null,
        sizeLabel: formatFileSize(file.size),
      })),
    );

    const nextRows: ConversionRow[] = [];
    for (const [index, file] of files.entries()) {
      const id = `${file.name}-${file.size}-${index}`;
      const pdfName = pdfFileNameFromHeic(file.name);
      try {
        const { pdf, preview } = await convertHeicFileToPdf(file);
        nextRows.push({
          id,
          fileName: file.name,
          pdfName,
          status: "done",
          error: "",
          url: URL.createObjectURL(pdf),
          previewUrl: URL.createObjectURL(preview),
          sizeLabel: formatFileSize(pdf.size),
        });
      } catch (error) {
        nextRows.push({
          id,
          fileName: file.name,
          pdfName,
          status: "error",
          error: error instanceof Error ? error.message : DECODE_ERROR,
          url: null,
          previewUrl: null,
          sizeLabel: formatFileSize(file.size),
        });
      }
      const pending = files.slice(nextRows.length).map((rest, offset) => ({
        id: `${rest.name}-${rest.size}-${nextRows.length + offset}`,
        fileName: rest.name,
        pdfName: pdfFileNameFromHeic(rest.name),
        status: "converting" as const,
        error: "",
        url: null,
        previewUrl: null,
        sizeLabel: formatFileSize(rest.size),
      }));
      urlsRef.current = collectUrls(nextRows);
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
          PDF downloads appear here after you pick files. Use Safari or a recent
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
                        ? `${row.pdfName} · ${row.sizeLabel}`
                        : row.error}
                  </p>
                </div>
                {row.status === "done" && row.url ? (
                  <div className="flex shrink-0 items-center gap-3">
                    {row.previewUrl ? (
                      // Preview of the local JPEG used inside the PDF; next/image is for remote assets.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.previewUrl}
                        alt={`Preview of ${row.fileName}`}
                        className="size-12 rounded-md object-cover"
                      />
                    ) : null}
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
