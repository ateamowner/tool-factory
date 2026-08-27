export const HEIC_EXTENSIONS = [".heic", ".heif", ".hif"] as const;

export const MAX_HEIC_BYTES = 50 * 1024 * 1024;
export const MAX_HEIC_FILES = 20;

const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
]);

const HEIF_CONTAINER_BRANDS = new Set(["mif1", "msf1"]);
const AVIF_BRANDS = new Set(["avif", "avis", "avio"]);

export const NOT_HEIC_ERROR =
  "This file is not HEIC or HEIF. Choose a .heic or .heif file.";
export const INVALID_HEIC_CONTENTS_ERROR =
  "This file is not a valid HEIC or HEIF image. The contents do not match the HEIC format.";
export const DECODE_ERROR =
  "This browser could not decode the HEIC file. Try another photo, or use a browser that can read HEIC.";
export const EMPTY_FILE_ERROR = "This file is empty. Choose a HEIC or HEIF photo.";
export const TOO_LARGE_ERROR = "This file is larger than 50 MB. Choose a smaller HEIC image.";
export const TOO_MANY_FILES_ERROR = "Choose up to 20 HEIC files at a time.";

export function pngFileNameFromHeic(name: string): string {
  const trimmed = name.trim() || "image.heic";
  if (/\.(heic|heif|hif)$/i.test(trimmed)) {
    return trimmed.replace(/\.(heic|heif|hif)$/i, ".png");
  }
  return `${trimmed}.png`;
}

export function looksLikeHeicNameOrType(file: { name: string; type: string }): boolean {
  const lower = file.name.toLowerCase();
  if (HEIC_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  const type = file.type.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence"
  );
}

export function readFtypBrands(bytes: Uint8Array): string[] {
  if (bytes.length < 12) return [];
  const boxType = String.fromCharCode(bytes[4]!, bytes[5]!, bytes[6]!, bytes[7]!);
  if (boxType !== "ftyp") return [];

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const size = view.getUint32(0);
  const end = Math.min(bytes.length, size > 8 ? size : bytes.length);
  const brands: string[] = [];

  for (let offset = 8; offset + 4 <= end; offset += 4) {
    if (offset === 12) continue;
    brands.push(
      String.fromCharCode(
        bytes[offset]!,
        bytes[offset + 1]!,
        bytes[offset + 2]!,
        bytes[offset + 3]!,
      ),
    );
  }

  return brands;
}

export function hasHeicFtyp(bytes: Uint8Array): boolean {
  const brands = readFtypBrands(bytes).map((brand) => brand.toLowerCase());
  if (brands.length === 0) return false;
  if (brands.some((brand) => AVIF_BRANDS.has(brand))) return false;
  if (brands.some((brand) => HEIC_BRANDS.has(brand))) return true;
  return brands.some((brand) => HEIF_CONTAINER_BRANDS.has(brand));
}

export function heicValidationError(
  file: { name: string; type: string; size?: number },
  bytes?: Uint8Array,
): string | null {
  if (file.size === 0) return EMPTY_FILE_ERROR;
  if (typeof file.size === "number" && file.size > MAX_HEIC_BYTES) {
    return TOO_LARGE_ERROR;
  }

  if (bytes && bytes.length > 0) {
    if (hasHeicFtyp(bytes)) return null;
    return looksLikeHeicNameOrType(file) ? INVALID_HEIC_CONTENTS_ERROR : NOT_HEIC_ERROR;
  }

  if (!looksLikeHeicNameOrType(file)) return NOT_HEIC_ERROR;
  return null;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
