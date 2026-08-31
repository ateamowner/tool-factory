export const EXCEL_EXTENSIONS = [".xlsx", ".xls"] as const;

export const MAX_EXCEL_BYTES = 20 * 1024 * 1024;
export const MAX_EXCEL_FILES = 20;
export const MAX_PDF_ROWS = 2_000;
export const MAX_PDF_COLS = 24;

export const PAGE_WIDTH = 792;
export const PAGE_HEIGHT = 612;
export const PAGE_MARGIN = 36;

export const NOT_EXCEL_ERROR =
  "This file is not Excel. Choose a .xlsx or .xls spreadsheet.";
export const INVALID_EXCEL_CONTENTS_ERROR =
  "This file is not a valid Excel workbook. The contents do not match the .xlsx or .xls format.";
export const PARSE_ERROR =
  "This browser could not read the spreadsheet. Try another file, or export it as .xlsx first.";
export const EMPTY_FILE_ERROR = "This file is empty. Choose an Excel spreadsheet.";
export const EMPTY_WORKBOOK_ERROR =
  "This workbook has no sheets with data. Add at least one cell, then try again.";
export const TOO_LARGE_ERROR = "This file is larger than 20 MB. Choose a smaller spreadsheet.";
export const TOO_MANY_FILES_ERROR = "Choose up to 20 Excel files at a time.";

export type ExcelSheet = {
  name: string;
  rows: string[][];
};

const encoder = new TextEncoder();

const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

export function pdfFileNameFromExcel(name: string): string {
  const trimmed = name.trim() || "spreadsheet.xlsx";
  if (/\.(xlsx|xls)$/i.test(trimmed)) {
    return trimmed.replace(/\.(xlsx|xls)$/i, ".pdf");
  }
  return `${trimmed}.pdf`;
}

export function looksLikeExcelNameOrType(file: { name: string; type: string }): boolean {
  const lower = file.name.toLowerCase();
  if (EXCEL_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  const type = file.type.toLowerCase();
  return (
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.ms-excel.sheet.macroenabled.12"
  );
}

export function hasExcelSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)) {
    return true;
  }
  if (bytes.length < 8) return false;
  return OLE_MAGIC.every((value, index) => bytes[index] === value);
}

export function excelValidationError(
  file: { name: string; type: string; size?: number },
  bytes?: Uint8Array,
): string | null {
  if (file.size === 0) return EMPTY_FILE_ERROR;
  if (typeof file.size === "number" && file.size > MAX_EXCEL_BYTES) {
    return TOO_LARGE_ERROR;
  }

  if (bytes && bytes.length > 0) {
    if (hasExcelSignature(bytes)) return null;
    return looksLikeExcelNameOrType(file) ? INVALID_EXCEL_CONTENTS_ERROR : NOT_EXCEL_ERROR;
  }

  if (!looksLikeExcelNameOrType(file)) return NOT_EXCEL_ERROR;
  return null;
}

export function cellToText(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value).replace(/\r\n|\r|\n/g, " ").trim();
}

export function normalizeSheets(sheets: ExcelSheet[]): ExcelSheet[] {
  const normalized = sheets
    .map((sheet) => {
      const name = (sheet.name || "Sheet").trim() || "Sheet";
      const rows = sheet.rows
        .map((row) => row.map((cell) => cellToText(cell)))
        .filter((row) => row.some((cell) => cell.length > 0));
      const width = Math.min(
        MAX_PDF_COLS,
        rows.reduce((max, row) => Math.max(max, row.length), 0),
      );
      const clipped = rows.slice(0, MAX_PDF_ROWS).map((row) => {
        const next = row.slice(0, width);
        while (next.length < width) next.push("");
        return next;
      });
      return { name, rows: clipped };
    })
    .filter((sheet) => sheet.rows.length > 0);

  return normalized;
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

function escapePdfText(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (char === "\\") return "\\\\";
      if (char === "(") return "\\(";
      if (char === ")") return "\\)";
      if (code === 9) return " ";
      if (code < 32 || code > 126) {
        if (code >= 160 && code <= 255) return `\\${code.toString(8).padStart(3, "0")}`;
        return "?";
      }
      return char;
    })
    .join("");
}

const HELVETICA_WIDTHS: Record<string, number> = {
  " ": 278,
  "!": 278,
  '"': 355,
  "#": 556,
  $: 556,
  "%": 889,
  "&": 667,
  "'": 191,
  "(": 333,
  ")": 333,
  "*": 389,
  "+": 584,
  ",": 278,
  "-": 333,
  ".": 278,
  "/": 278,
  "0": 556,
  "1": 556,
  "2": 556,
  "3": 556,
  "4": 556,
  "5": 556,
  "6": 556,
  "7": 556,
  "8": 556,
  "9": 556,
  ":": 278,
  ";": 278,
  "<": 584,
  "=": 584,
  ">": 584,
  "?": 556,
  "@": 1015,
  A: 667,
  B: 667,
  C: 722,
  D: 722,
  E: 667,
  F: 611,
  G: 778,
  H: 722,
  I: 278,
  J: 500,
  K: 667,
  L: 556,
  M: 833,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 944,
  X: 667,
  Y: 667,
  Z: 611,
  "[": 278,
  "\\": 278,
  "]": 278,
  "^": 469,
  _: 556,
  "`": 333,
  a: 556,
  b: 556,
  c: 500,
  d: 556,
  e: 556,
  f: 278,
  g: 556,
  h: 556,
  i: 222,
  j: 222,
  k: 500,
  l: 222,
  m: 833,
  n: 556,
  o: 556,
  p: 556,
  q: 556,
  r: 333,
  s: 500,
  t: 278,
  u: 556,
  v: 500,
  w: 722,
  x: 500,
  y: 500,
  z: 500,
  "{": 334,
  "|": 260,
  "}": 334,
  "~": 584,
};

function measureText(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    width += HELVETICA_WIDTHS[char] ?? 600;
  }
  return (width * fontSize) / 1000;
}

function fitText(text: string, fontSize: number, maxWidth: number): string {
  if (measureText(text, fontSize) <= maxWidth) return text;
  const ellipsis = "…";
  if (measureText(ellipsis, fontSize) > maxWidth) return "";
  let end = text.length;
  while (end > 0 && measureText(text.slice(0, end) + ellipsis, fontSize) > maxWidth) {
    end -= 1;
  }
  return `${text.slice(0, end)}${ellipsis}`;
}

function columnWidths(rows: string[][], usableWidth: number): number[] {
  const colCount = rows[0]?.length ?? 0;
  if (colCount === 0) return [];

  const mins = Array.from({ length: colCount }, () => 28);
  const preferred = mins.map((min, index) => {
    let max = min;
    for (const row of rows.slice(0, 80)) {
      const cell = row[index] ?? "";
      max = Math.max(max, Math.min(160, measureText(cell, 8) + 10));
    }
    return max;
  });

  const total = preferred.reduce((sum, width) => sum + width, 0);
  if (total <= usableWidth) return preferred;

  const scale = usableWidth / total;
  return preferred.map((width) => Math.max(22, width * scale));
}

type PdfPage = {
  content: string;
};

function drawPage(
  sheetName: string,
  header: string[] | null,
  body: string[][],
  widths: number[],
  pageLabel: string,
): string {
  const lines: string[] = [];
  const usableWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  let y = PAGE_HEIGHT - PAGE_MARGIN;

  lines.push("0.15 0.16 0.18 RG");
  lines.push("0.15 0.16 0.18 rg");
  lines.push("/F2 11 Tf");
  lines.push(`BT ${PAGE_MARGIN} ${pdfNumber(y - 2)} Td (${escapePdfText(fitText(sheetName, 11, usableWidth - 80))}) Tj ET`);
  lines.push("/F1 8 Tf");
  lines.push(
    `BT ${pdfNumber(PAGE_WIDTH - PAGE_MARGIN - 70)} ${pdfNumber(y - 2)} Td (${escapePdfText(pageLabel)}) Tj ET`,
  );
  y -= 20;

  const rowHeight = 14;
  const drawRow = (cells: string[], headerRow: boolean) => {
    let x = PAGE_MARGIN;
    if (headerRow) {
      lines.push("0.93 0.92 0.88 rg");
      lines.push(
        `${pdfNumber(PAGE_MARGIN)} ${pdfNumber(y - rowHeight + 3)} ${pdfNumber(usableWidth)} ${pdfNumber(rowHeight)} re f`,
      );
    }
    lines.push("0.75 0.76 0.78 RG");
    lines.push("0.4 w");
    lines.push(
      `${pdfNumber(PAGE_MARGIN)} ${pdfNumber(y - rowHeight + 3)} ${pdfNumber(usableWidth)} ${pdfNumber(rowHeight)} re S`,
    );

    for (const [index, width] of widths.entries()) {
      const text = fitText(cells[index] ?? "", 8, width - 6);
      if (index > 0) {
        lines.push(
          `${pdfNumber(x)} ${pdfNumber(y - rowHeight + 3)} m ${pdfNumber(x)} ${pdfNumber(y + 3)} l S`,
        );
      }
      lines.push("0.07 0.08 0.1 rg");
      lines.push(headerRow ? "/F2 8 Tf" : "/F1 8 Tf");
      lines.push(`BT ${pdfNumber(x + 3)} ${pdfNumber(y - 7)} Td (${escapePdfText(text)}) Tj ET`);
      x += width;
    }
    y -= rowHeight;
  };

  if (header) drawRow(header, true);
  for (const row of body) drawRow(row, false);

  return `${lines.join("\n")}\n`;
}

export function sheetsToPdf(input: ExcelSheet[]): Uint8Array {
  const sheets = normalizeSheets(input);
  if (sheets.length === 0) throw new Error(EMPTY_WORKBOOK_ERROR);

  const usableWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const titleBlock = 20;
  const rowHeight = 14;
  const usableHeight = PAGE_HEIGHT - PAGE_MARGIN * 2 - titleBlock;
  const rowsPerPage = Math.max(1, Math.floor(usableHeight / rowHeight));

  const pages: PdfPage[] = [];

  for (const sheet of sheets) {
    const widths = columnWidths(sheet.rows, usableWidth);
    const header = sheet.rows[0] ?? [];
    const data = sheet.rows.slice(1);
    const firstPageCapacity = rowsPerPage;
    const headerOnLater = 1;
    const laterCapacity = Math.max(1, rowsPerPage - headerOnLater);

    if (data.length === 0) {
      pages.push({
        content: drawPage(sheet.name, header, [], widths, "1 / 1"),
      });
      continue;
    }

    const remainingAfterFirst = Math.max(0, data.length - (firstPageCapacity - 1));
    const extraPages = remainingAfterFirst === 0 ? 0 : Math.ceil(remainingAfterFirst / laterCapacity);
    const totalPages = 1 + extraPages;

    let offset = 0;
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const isFirst = pageIndex === 0;
      const take = isFirst ? firstPageCapacity - 1 : laterCapacity;
      const chunk = data.slice(offset, offset + take);
      offset += chunk.length;
      pages.push({
        content: drawPage(
          sheet.name,
          header,
          chunk,
          widths,
          `${pageIndex + 1} / ${totalPages}`,
        ),
      });
    }
  }

  const fontRegular = encode("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  const fontBold = encode("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

  const pageObjects: Uint8Array[] = [];
  const pageRefs: string[] = [];
  let nextId = 5;

  for (const page of pages) {
    const pageId = nextId;
    const contentId = nextId + 1;
    nextId += 2;
    pageRefs.push(`${pageId} 0 R`);
    const content = encode(page.content);
    pageObjects.push(
      encode(
        `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`,
      ),
    );
    pageObjects.push(
      encode(`${contentId} 0 obj\n<< /Length ${content.length} >>\nstream\n${page.content}endstream\nendobj\n`),
    );
  }

  const catalog = encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const pagesObj = encode(
    `2 0 obj\n<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>\nendobj\n`,
  );

  const objects = [catalog, pagesObj, fontRegular, fontBold, ...pageObjects];
  const header = encode("%PDF-1.4\n");
  const offsets = [0];
  let offset = header.length;
  for (const object of objects) {
    offsets.push(offset);
    offset += object.length;
  }

  const xrefStart = offset;
  const xref = `xref\n0 ${objects.length + 1}\n${xrefEntry(0, 65535, false)}${offsets
    .slice(1)
    .map((value) => xrefEntry(value))
    .join("")}`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return concatBytes([header, ...objects, encode(xref), encode(trailer)]);
}

export async function parseExcelBytes(bytes: Uint8Array): Promise<ExcelSheet[]> {
  const XLSX = await import("xlsx");
  let workbook: import("xlsx").WorkBook;
  try {
    workbook = XLSX.read(bytes, { type: "array", cellDates: true, raw: false });
  } catch {
    throw new Error(PARSE_ERROR);
  }

  const sheets: ExcelSheet[] = (workbook.SheetNames ?? []).map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = sheet
      ? (XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          defval: "",
          blankrows: false,
        }) as unknown[][])
      : [];
    return {
      name: name || "Sheet",
      rows: rows.map((row) => (Array.isArray(row) ? row.map((cell) => cellToText(cell)) : [])),
    };
  });

  const normalized = normalizeSheets(sheets);
  if (normalized.length === 0) throw new Error(EMPTY_WORKBOOK_ERROR);
  return normalized;
}
