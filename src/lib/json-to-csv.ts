export const MAX_JSON_CHARS = 2_000_000;
export const MAX_ROWS = 50_000;
export const MAX_COLUMNS = 500;

export type JsonToCsvOk = {
  ok: true;
  csv: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  summary: string;
};

export type JsonToCsvErr = {
  ok: false;
  error: string;
};

export type JsonToCsvResult = JsonToCsvOk | JsonToCsvErr;

const EMPTY_ERROR = "Paste JSON or choose a .json file to convert.";
const PARSE_ERROR = "Could not parse JSON. Check for trailing commas, single quotes, or missing brackets.";
const TYPE_ERROR =
  "JSON must be an object, an array of objects, or an array of arrays. Primitive values alone cannot become a table.";
const TOO_LARGE_ERROR = `JSON is too large. Keep input under ${MAX_JSON_CHARS.toLocaleString()} characters.`;
const TOO_MANY_ROWS_ERROR = `Too many rows. Keep the table under ${MAX_ROWS.toLocaleString()} data rows.`;
const TOO_MANY_COLUMNS_ERROR = `Too many columns. Keep the table under ${MAX_COLUMNS} columns.`;
const EMPTY_ARRAY_ERROR = "The JSON array is empty — there are no rows to convert.";

/** RFC 4180-style cell: quote when the value contains comma, quote, or newline. */
export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function cellFromValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return String(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "bigint") return value.toString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function columnsFromObjects(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  const columns: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  return columns;
}

function buildCsv(columns: string[], rows: string[][]): string {
  const lines = [
    columns.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  // Trailing newline makes spreadsheet apps happier.
  return `${lines.join("\n")}\n`;
}

function convertObjectArray(rows: Record<string, unknown>[]): JsonToCsvResult {
  if (rows.length === 0) return { ok: false, error: EMPTY_ARRAY_ERROR };
  if (rows.length > MAX_ROWS) return { ok: false, error: TOO_MANY_ROWS_ERROR };

  const columns = columnsFromObjects(rows);
  if (columns.length === 0) {
    return {
      ok: false,
      error: "Objects have no keys — nothing to put in CSV columns.",
    };
  }
  if (columns.length > MAX_COLUMNS) {
    return { ok: false, error: TOO_MANY_COLUMNS_ERROR };
  }

  const dataRows = rows.map((row) =>
    columns.map((column) => cellFromValue(row[column])),
  );
  const csv = buildCsv(columns, dataRows);
  return {
    ok: true,
    csv,
    rowCount: dataRows.length,
    columnCount: columns.length,
    columns,
    summary: `${dataRows.length.toLocaleString()} row${dataRows.length === 1 ? "" : "s"}, ${columns.length} column${columns.length === 1 ? "" : "s"}`,
  };
}

function convertArrayOfArrays(rows: unknown[][]): JsonToCsvResult {
  if (rows.length === 0) return { ok: false, error: EMPTY_ARRAY_ERROR };

  const first = rows[0] ?? [];
  const firstAllStrings =
    first.length > 0 && first.every((cell) => typeof cell === "string");
  const headerRow = firstAllStrings;
  const dataSource = headerRow ? rows.slice(1) : rows;

  if (dataSource.length === 0) {
    return {
      ok: false,
      error: headerRow
        ? "Only a header row was found — add at least one data row."
        : EMPTY_ARRAY_ERROR,
    };
  }
  if (dataSource.length > MAX_ROWS) {
    return { ok: false, error: TOO_MANY_ROWS_ERROR };
  }

  const width = Math.max(
    first.length,
    ...dataSource.map((row) => (Array.isArray(row) ? row.length : 0)),
  );
  if (width === 0) {
    return { ok: false, error: "Rows are empty — nothing to convert." };
  }
  if (width > MAX_COLUMNS) {
    return { ok: false, error: TOO_MANY_COLUMNS_ERROR };
  }

  const columns = headerRow
    ? first.map((cell, index) => {
        const label = String(cell).trim();
        return label === "" ? `column_${index + 1}` : label;
      })
    : Array.from({ length: width }, (_, index) => `column_${index + 1}`);

  // Deduplicate header labels so spreadsheet columns stay unique.
  const seen = new Map<string, number>();
  const uniqueColumns = columns.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });

  const dataRows = dataSource.map((row) => {
    const cells = Array.isArray(row) ? row : [];
    return Array.from({ length: width }, (_, index) =>
      cellFromValue(cells[index]),
    );
  });

  const csv = buildCsv(uniqueColumns, dataRows);
  return {
    ok: true,
    csv,
    rowCount: dataRows.length,
    columnCount: uniqueColumns.length,
    columns: uniqueColumns,
    summary: `${dataRows.length.toLocaleString()} row${dataRows.length === 1 ? "" : "s"}, ${uniqueColumns.length} column${uniqueColumns.length === 1 ? "" : "s"}`,
  };
}

export function jsonValueToCsv(value: unknown): JsonToCsvResult {
  if (Array.isArray(value)) {
    if (value.length === 0) return { ok: false, error: EMPTY_ARRAY_ERROR };

    if (value.every((item) => isPlainObject(item))) {
      return convertObjectArray(value as Record<string, unknown>[]);
    }

    if (value.every((item) => Array.isArray(item))) {
      return convertArrayOfArrays(value as unknown[][]);
    }

    // Mixed array: wrap primitives/objects as a single "value" column when uniform-ish fails.
    if (value.every((item) => !Array.isArray(item))) {
      const rows = value.map((item, index) => {
        if (isPlainObject(item)) {
          return { index, ...item };
        }
        return { index, value: item };
      });
      return convertObjectArray(rows);
    }

    return {
      ok: false,
      error:
        "Mixed arrays are not supported. Use an array of objects, an array of arrays, or a single object.",
    };
  }

  if (isPlainObject(value)) {
    return convertObjectArray([value]);
  }

  return { ok: false, error: TYPE_ERROR };
}

export function convertJsonToCsv(input: string): JsonToCsvResult {
  const trimmed = input.trim();
  if (trimmed === "") return { ok: false, error: EMPTY_ERROR };
  if (trimmed.length > MAX_JSON_CHARS) {
    return { ok: false, error: TOO_LARGE_ERROR };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    return { ok: false, error: PARSE_ERROR };
  }

  return jsonValueToCsv(parsed);
}

export function csvFileNameFromJsonName(name: string): string {
  const base = name.replace(/\.[^.]+$/i, "").trim();
  const safe = (base === "" ? "data" : base).replace(/[^\w.-]+/g, "_");
  return `${safe}.csv`;
}
