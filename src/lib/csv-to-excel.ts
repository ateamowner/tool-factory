export const MAX_CSV_CHARS = 2_000_000;
export const MAX_ROWS = 50_000;
export const MAX_COLUMNS = 500;
export const MAX_PREVIEW_ROWS = 20;

export type CsvToExcelOk = {
  ok: true;
  rows: string[][];
  bytes: Uint8Array;
  rowCount: number;
  columnCount: number;
  columns: string[];
  summary: string;
};

export type CsvToExcelErr = {
  ok: false;
  error: string;
};

export type CsvToExcelResult = CsvToExcelOk | CsvToExcelErr;

const EMPTY_ERROR = "Paste CSV or choose a .csv file to convert.";
const TOO_LARGE_ERROR = `CSV is too large. Keep input under ${MAX_CSV_CHARS.toLocaleString()} characters.`;
const TOO_MANY_ROWS_ERROR = `Too many rows. Keep the table under ${MAX_ROWS.toLocaleString()} data rows.`;
const TOO_MANY_COLUMNS_ERROR = `Too many columns. Keep the table under ${MAX_COLUMNS} columns.`;
const EMPTY_TABLE_ERROR = "The CSV has no rows to convert.";
const BUILD_ERROR =
  "Could not build an Excel workbook from this CSV. Check the text and try again.";

/** RFC 4180-style CSV parse: commas, quoted fields, "" escapes, CRLF/LF rows. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]!;
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\r") {
      if (next === "\n") i += 1;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }

    if (char === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  // Trailing field / last row (no final newline)
  if (inQuotes) {
    // Unclosed quote: still emit what we have so the caller can surface a table.
    row.push(field);
    rows.push(row);
  } else if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop a single trailing empty row from a final newline
  if (
    rows.length > 0 &&
    rows[rows.length - 1]!.length === 1 &&
    rows[rows.length - 1]![0] === ""
  ) {
    rows.pop();
  }

  return rows;
}

export function normalizeCsvRows(rows: string[][]): string[][] {
  if (rows.length === 0) return [];
  const width = Math.max(...rows.map((row) => row.length), 0);
  if (width === 0) return [];
  return rows.map((row) => {
    const next = row.slice(0, width);
    while (next.length < width) next.push("");
    return next;
  });
}

export function excelFileNameFromCsvName(name: string): string {
  const base = name.replace(/\.[^.]+$/i, "").trim();
  const safe = (base === "" ? "data" : base).replace(/[^\w.-]+/g, "_");
  return `${safe}.xlsx`;
}

export function columnsFromRows(rows: string[][]): string[] {
  if (rows.length === 0) return [];
  const header = rows[0]!;
  const width = header.length;
  const seen = new Map<string, number>();
  return Array.from({ length: width }, (_, index) => {
    const raw = (header[index] ?? "").trim();
    const name = raw === "" ? `column_${index + 1}` : raw;
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });
}

export async function rowsToXlsxBytes(rows: string[][]): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const out = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  }) as ArrayBuffer | Uint8Array | number[];
  if (out instanceof Uint8Array) return out;
  if (out instanceof ArrayBuffer) return new Uint8Array(out);
  return new Uint8Array(out);
}

export async function convertCsvToExcel(input: string): Promise<CsvToExcelResult> {
  const trimmed = input.replace(/^\uFEFF/, "");
  if (trimmed.trim() === "") return { ok: false, error: EMPTY_ERROR };
  if (trimmed.length > MAX_CSV_CHARS) {
    return { ok: false, error: TOO_LARGE_ERROR };
  }

  const parsed = normalizeCsvRows(parseCsv(trimmed));
  if (parsed.length === 0) return { ok: false, error: EMPTY_TABLE_ERROR };

  const dataRowCount = Math.max(parsed.length - 1, 0);
  // Count all rows including header toward the row cap for very wide dumps.
  if (parsed.length > MAX_ROWS + 1) {
    return { ok: false, error: TOO_MANY_ROWS_ERROR };
  }

  const columnCount = parsed[0]?.length ?? 0;
  if (columnCount === 0) return { ok: false, error: EMPTY_TABLE_ERROR };
  if (columnCount > MAX_COLUMNS) {
    return { ok: false, error: TOO_MANY_COLUMNS_ERROR };
  }

  const columns = columnsFromRows(parsed);
  let bytes: Uint8Array;
  try {
    bytes = await rowsToXlsxBytes(parsed);
  } catch {
    return { ok: false, error: BUILD_ERROR };
  }

  const rowLabel =
    dataRowCount === 0
      ? "header only"
      : `${dataRowCount.toLocaleString()} data row${dataRowCount === 1 ? "" : "s"}`;

  return {
    ok: true,
    rows: parsed,
    bytes,
    rowCount: dataRowCount,
    columnCount,
    columns,
    summary: `${rowLabel}, ${columnCount} column${columnCount === 1 ? "" : "s"}`,
  };
}
