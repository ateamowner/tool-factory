"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  DECODE_ERROR,
  JPEG_QUALITY,
  MAX_PNG_FILES,
  TOO_MANY_FILES_ERROR,
  formatFileSize,
  jpgFileNameFromPng,
  pngValidationError,
  readFileAsArrayBuffer,
  readFileAsDataUrl,
} from "@/lib/png-to-jpg";

type RowStatus = "converting" | "done" | "error";

type ConversionRow = {
  id: string;
  fileName: string;
  jpgName: string;
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

function loadImageFromDataUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(DECODE_ERROR));
    image.src = src;
  });
}

async function imageToJpegBlob(image: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  if (canvas.width < 1 || canvas.height < 1) throw new Error(DECODE_ERROR);

  const context = canvas.getContext("2d");
  if (!context) throw new Error(DECODE_ERROR);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
  if (!blob) throw new Error(DECODE_ERROR);
  return blob;
}

async function convertPngFileToJpg(file: File): Promise<Blob> {
  const header = new Uint8Array(await readFileAsArrayBuffer(file.slice(0, 8)));
  const invalid = pngValidationError(file, header);
  if (invalid) throw new Error(invalid);

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImageFromDataUrl(dataUrl);
    return await imageToJpegBlob(image);
  } catch (error) {
    if (error instanceof Error && error.message !== DECODE_ERROR) {
      throw new Error(DECODE_ERROR);
    }
    throw error instanceof Error ? error : new Error(DECODE_ERROR);
  }
}

export function PngToJpgConverter() {
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
    if (files.length > MAX_PNG_FILES) {
      setFormError(TOO_MANY_FILES_ERROR);
      return;
    }

    setFormError("");
    setBusy(true);
    replaceRows(
      files.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}`,
        fileName: file.name,
        jpgName: jpgFileNameFromPng(file.name),
        status: "converting",
        error: "",
        url: null,
        sizeLabel: formatFileSize(file.size),
      })),
    );

    const nextRows: ConversionRow[] = [];
    for (const [index, file] of files.entries()) {
      const id = `${file.name}-${file.size}-${index}`;
      const jpgName = jpgFileNameFromPng(file.name);
      try {
        const blob = await convertPngFileToJpg(file);
        nextRows.push({
          id,
          fileName: file.name,
          jpgName,
          status: "done",
          error: "",
          url: URL.createObjectURL(blob),
          sizeLabel: formatFileSize(blob.size),
        });
      } catch (error) {
        nextRows.push({
          id,
          fileName: file.name,
          jpgName,
          status: "error",
          error: error instanceof Error ? error.message : DECODE_ERROR,
          url: null,
          sizeLabel: formatFileSize(file.size),
        });
      }
      const pending = files.slice(nextRows.length).map((rest, offset) => ({
        id: `${rest.name}-${rest.size}-${nextRows.length + offset}`,
        fileName: rest.name,
        jpgName: jpgFileNameFromPng(rest.name),
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
          Select one or more .png files. Conversion runs in this tab — images
          are not uploaded.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <label htmlFor={inputId} className="btn-primary cursor-pointer">
            Choose PNG files
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept=".png,.PNG,image/png"
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
          JPG downloads appear here after you pick files. Transparent PNGs get a
          white background.
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
                    if (row.url) downloadUrl(row.url, row.jpgName);
                  }
                }}
              >
                Download all JPGs
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
                        ? `${row.jpgName} · ${row.sizeLabel}`
                        : row.error}
                  </p>
                </div>
                {row.status === "done" && row.url ? (
                  <div className="flex shrink-0 items-center gap-3">
                    {/* Preview of the local JPG blob; next/image is for remote assets. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.url}
                      alt={`JPG preview of ${row.fileName}`}
                      className="size-12 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => downloadUrl(row.url!, row.jpgName)}
                    >
                      Download JPG
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
