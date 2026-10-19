export type AreaShape = "rectangle" | "triangle" | "circle" | "l-shape";

/** A length entered as feet plus inches. Blank parts count as 0. */
export type FeetInches = { ft: string; in: string };

export type RoomInput = {
  shape: AreaShape;
  /** Dimension fields by key; see SHAPE_FIELDS for the keys each shape uses. */
  dims: Record<string, FeetInches>;
  /** How many identical rooms or areas. Blank counts as 1. */
  quantity?: string;
};

export type RoomResult = { valid: true; areaSqFt: number; eachSqFt: number; quantity: number } | { valid: false; error: string };

export type AreaTotals = {
  sqFt: number;
  sqIn: number;
  sqYd: number;
  sqM: number;
};

export const SQ_M_PER_SQ_FT = 0.09290304;

export const SHAPE_FIELDS: Record<AreaShape, { key: string; label: string }[]> = {
  rectangle: [
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
  ],
  triangle: [
    { key: "base", label: "Base" },
    { key: "height", label: "Height" },
  ],
  circle: [{ key: "diameter", label: "Diameter" }],
  "l-shape": [
    { key: "length1", label: "Section A length" },
    { key: "width1", label: "Section A width" },
    { key: "length2", label: "Section B length" },
    { key: "width2", label: "Section B width" },
  ],
};

/** Parse a user-entered number, allowing commas and spaces. Blank returns 0; invalid returns null. */
export function parseNumberInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Convert feet + inches to decimal feet. Returns null for invalid or negative parts. */
export function toFeet(value: FeetInches | undefined): number | null {
  const ft = parseNumberInput(value?.ft);
  const inches = parseNumberInput(value?.in);
  if (ft === null || inches === null || ft < 0 || inches < 0) return null;
  return ft + inches / 12;
}

export function rectangleArea(length: number, width: number): number {
  return length * width;
}

export function triangleArea(base: number, height: number): number {
  return (base * height) / 2;
}

export function circleArea(diameter: number): number {
  const r = diameter / 2;
  return Math.PI * r * r;
}

/** An L-shape split into two non-overlapping rectangles, A and B. */
export function lShapeArea(length1: number, width1: number, length2: number, width2: number): number {
  return length1 * width1 + length2 * width2;
}

export function computeRoom(room: RoomInput): RoomResult {
  const fields = SHAPE_FIELDS[room.shape];
  if (!fields) return { valid: false, error: "Pick a shape." };
  const values: Record<string, number> = {};
  for (const field of fields) {
    const v = toFeet(room.dims[field.key]);
    if (v === null) return { valid: false, error: `${field.label} must be a number of 0 or more.` };
    if (v <= 0) return { valid: false, error: `Enter a ${field.label.toLowerCase()} greater than 0.` };
    values[field.key] = v;
  }
  const qtyParsed = parseNumberInput(room.quantity);
  const quantity = qtyParsed === 0 && (room.quantity ?? "").trim() === "" ? 1 : qtyParsed;
  if (quantity === null || quantity <= 0) return { valid: false, error: "Quantity must be greater than 0." };

  let each: number;
  switch (room.shape) {
    case "rectangle":
      each = rectangleArea(values.length, values.width);
      break;
    case "triangle":
      each = triangleArea(values.base, values.height);
      break;
    case "circle":
      each = circleArea(values.diameter);
      break;
    case "l-shape":
      each = lShapeArea(values.length1, values.width1, values.length2, values.width2);
      break;
  }
  return { valid: true, eachSqFt: each, areaSqFt: each * quantity, quantity };
}

export function convertArea(sqFt: number): AreaTotals {
  return { sqFt, sqIn: sqFt * 144, sqYd: sqFt / 9, sqM: sqFt * SQ_M_PER_SQ_FT };
}

/** Sum valid rooms and add an optional waste percent. Invalid rooms are skipped and counted. */
export function totalArea(
  rooms: RoomInput[],
  wastePercentRaw?: string,
): { base: AreaTotals; withWaste: AreaTotals; wastePercent: number; validRooms: number; invalidRooms: number } | { error: string } {
  const waste = parseNumberInput(wastePercentRaw);
  if (waste === null || waste < 0) return { error: "Waste must be 0% or more." };
  let sum = 0;
  let validRooms = 0;
  let invalidRooms = 0;
  for (const room of rooms) {
    const r = computeRoom(room);
    if (r.valid) {
      sum += r.areaSqFt;
      validRooms += 1;
    } else {
      invalidRooms += 1;
    }
  }
  if (validRooms === 0) return { error: "Enter the dimensions of at least one room or area." };
  return {
    base: convertArea(sum),
    withWaste: convertArea(sum * (1 + waste / 100)),
    wastePercent: waste,
    validRooms,
    invalidRooms,
  };
}

/** Format with thousands separators and up to `digits` decimals. */
export function formatArea(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return String(n);
  const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
  if (rounded === 0) return "0";
  return rounded.toLocaleString("en-US", { maximumFractionDigits: digits });
}
