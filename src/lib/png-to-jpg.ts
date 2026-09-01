export const PNG_EXTENSIONS = [".png"] as const;

export const MAX_PNG_BYTES = 50 * 1024 * 1024;
export const MAX_PNG_FILES = 20;
export const JPEG_QUALITY = 0.92;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

export const NOT_PNG_ERROR = "This file is not PNG. Choose a .png image.";
export const INVALID_PNG_CONTENTS_ERROR =
  "This file is not a valid PNG image. The contents do not match the PNG format.";
export const DECODE_ERROR =
  "This browser could not decode the PNG file. Try another image, or use a recent browser.";
export const EMPTY_FILE_ERROR = "This file is empty. Choose a PNG image.";
export const TOO_LARGE_ERROR = "This file is larger than 50 MB. Choose a smaller PNG image.";
export const TOO_MANY_FILES_ERROR = "Choose up to 20 PNG files at a time.";

export function jpgFileNameFromPng(name: string): string {
  const trimmed = name.trim() || "image.png";
  if (/\.png$/i.test(trimmed)) {
    return trimmed.replace(/\.png$/i, ".jpg");
  }
  return `${trimmed}.jpg`;
}

export function looksLikePngNameOrType(file: { name: string; type: string }): boolean {
  const lower = file.name.toLowerCase();
  if (PNG_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  return file.type.toLowerCase() === "image/png";
}

export function hasPngSignature(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) return false;
  return PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

export function pngValidationError(
  file: { name: string; type: string; size?: number },
  bytes?: Uint8Array,
): string | null {
  if (file.size === 0) return EMPTY_FILE_ERROR;
  if (typeof file.size === "number" && file.size > MAX_PNG_BYTES) {
    return TOO_LARGE_ERROR;
  }

  if (bytes && bytes.length > 0) {
    if (hasPngSignature(bytes)) return null;
    return looksLikePngNameOrType(file) ? INVALID_PNG_CONTENTS_ERROR : NOT_PNG_ERROR;
  }

  if (!looksLikePngNameOrType(file)) return NOT_PNG_ERROR;
  return null;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function readFileAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }
      reject(new Error(DECODE_ERROR));
    };
    reader.onerror = () => reject(new Error(DECODE_ERROR));
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error(DECODE_ERROR));
    };
    reader.onerror = () => reject(new Error(DECODE_ERROR));
    reader.readAsDataURL(file);
  });
}
