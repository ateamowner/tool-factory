export const PDF_MAX_PAGE_SIDE = 792;
export const JPEG_QUALITY = 0.92;

const encoder = new TextEncoder();

export function pdfFileNameFromHeic(name: string): string {
  const trimmed = name.trim() || "image.heic";
  if (/\.(heic|heif|hif)$/i.test(trimmed)) {
    return trimmed.replace(/\.(heic|heif|hif)$/i, ".pdf");
  }
  return `${trimmed}.pdf`;
}

export function fitPdfPage(
  imageWidth: number,
  imageHeight: number,
  maxSide = PDF_MAX_PAGE_SIDE,
): { width: number; height: number } {
  if (
    !Number.isFinite(imageWidth) ||
    !Number.isFinite(imageHeight) ||
    imageWidth < 1 ||
    imageHeight < 1
  ) {
    throw new Error("Decoded image has no dimensions.");
  }

  const scale = Math.min(1, maxSide / Math.max(imageWidth, imageHeight));
  return {
    width: Math.max(1, imageWidth * scale),
    height: Math.max(1, imageHeight * scale),
  };
}

export function readJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1]!;
    if (marker === 0xd9) return null;
    if (marker === 0xda) return null;

    if (marker >= 0xd0 && marker <= 0xd7) {
      offset += 2;
      continue;
    }

    if (offset + 3 >= bytes.length) return null;
    const length = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
    if (length < 2) return null;

    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      if (offset + 8 >= bytes.length) return null;
      const height = (bytes[offset + 5]! << 8) | bytes[offset + 6]!;
      const width = (bytes[offset + 7]! << 8) | bytes[offset + 8]!;
      if (width < 1 || height < 1) return null;
      return { width, height };
    }

    offset += 2 + length;
  }

  return null;
}

function encode(text: string): Uint8Array {
  return encoder.encode(text);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function pdfNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function xrefEntry(offset: number, generation = 0, used = true): string {
  const type = used ? "n" : "f";
  return `${String(offset).padStart(10, "0")} ${String(generation).padStart(5, "0")} ${type} \n`;
}

export function jpegBytesToPdf(
  jpeg: Uint8Array,
  imageWidth: number,
  imageHeight: number,
): Uint8Array {
  if (jpeg.length < 2 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) {
    throw new Error("Decoded image is not a JPEG.");
  }

  const page = fitPdfPage(imageWidth, imageHeight);
  const pageWidth = pdfNumber(page.width);
  const pageHeight = pdfNumber(page.height);
  const pixelWidth = Math.round(imageWidth);
  const pixelHeight = Math.round(imageHeight);
  const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  const content = encode(contentStream);

  const objects = [
    encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"),
    encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"),
    encode(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    ),
    concatBytes([
      encode(
        `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      ),
      jpeg,
      encode("endstream\nendobj\n"),
    ]),
    encode(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${contentStream}endstream\nendobj\n`),
  ];

  const header = encode("%PDF-1.4\n");
  const offsets = [0];
  let offset = header.length;
  for (const object of objects) {
    offsets.push(offset);
    offset += object.length;
  }

  const xrefStart = offset;
  const xref = `xref\n0 6\n${xrefEntry(0, 65535, false)}${offsets
    .slice(1)
    .map((value) => xrefEntry(value))
    .join("")}`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return concatBytes([header, ...objects, encode(xref), encode(trailer)]);
}
