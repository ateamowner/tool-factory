export type JsonIndent = 2 | 4 | "tab";

export type JsonFormatResult =
  | { ok: true; output: string; stats: JsonStats }
  | { ok: false; error: string; line?: number; column?: number };

export type JsonStats = {
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  keys: number;
  depth: number;
  bytes: number;
};

export function indentString(indent: JsonIndent): string {
  return indent === "tab" ? "\t" : " ".repeat(indent);
}

/** Convert a character offset into a 1-based line and column. */
export function offsetToLineColumn(
  text: string,
  offset: number,
): { line: number; column: number } {
  const safe = Math.max(0, Math.min(offset, text.length));
  let line = 1;
  let column = 1;
  for (let i = 0; i < safe; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function describeError(text: string, err: unknown): {
  error: string;
  line?: number;
  column?: number;
} {
  const message = err instanceof Error ? err.message : String(err);
  const lineCol = /line (\d+) column (\d+)/i.exec(message);
  if (lineCol) {
    return {
      error: message,
      line: Number(lineCol[1]),
      column: Number(lineCol[2]),
    };
  }
  const pos = /position (\d+)/i.exec(message);
  if (pos) {
    const { line, column } = offsetToLineColumn(text, Number(pos[1]));
    return { error: message, line, column };
  }
  return { error: message };
}

function typeOf(value: unknown): JsonStats["type"] {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  const t = typeof value;
  if (t === "object") return "object";
  if (t === "string" || t === "number" || t === "boolean") return t;
  return "null";
}

export function jsonStats(value: unknown): Omit<JsonStats, "bytes"> {
  let keys = 0;
  let depth = 0;
  const walk = (node: unknown, level: number) => {
    if (node !== null && typeof node === "object") {
      depth = Math.max(depth, level);
      if (Array.isArray(node)) {
        for (const item of node) walk(item, level + 1);
      } else {
        for (const [, child] of Object.entries(node as Record<string, unknown>)) {
          keys += 1;
          walk(child, level + 1);
        }
      }
    }
  };
  walk(value, 1);
  return { type: typeOf(value), keys, depth };
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export type FormatOptions = {
  indent?: JsonIndent;
  minify?: boolean;
  sortKeys?: boolean;
};

/** Validate and pretty-print (or minify) JSON text. Strict JSON only. */
export function formatJson(text: string, options: FormatOptions = {}): JsonFormatResult {
  const source = text.replace(/^\uFEFF/, "");
  if (source.trim().length === 0) {
    return { ok: false, error: "Paste JSON to format." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (err) {
    return { ok: false, ...describeError(source, err) };
  }
  const value = options.sortKeys ? sortKeysDeep(parsed) : parsed;
  const output = options.minify
    ? JSON.stringify(value)
    : JSON.stringify(value, null, indentString(options.indent ?? 2));
  const bytes = new TextEncoder().encode(output).length;
  return { ok: true, output, stats: { ...jsonStats(parsed), bytes } };
}
