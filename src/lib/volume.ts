export type Unit = "mm" | "cm" | "m" | "in" | "ft" | "yd";
export type Shape = "cube" | "prism" | "cylinder" | "sphere" | "cone" | "pyramid";

export const UNITS: Unit[] = ["mm", "cm", "m", "in", "ft", "yd"];

/** Length of one unit in meters. */
export const METERS_PER_UNIT: Record<Unit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
};

export const SHAPE_FIELDS: Record<Shape, { key: string; label: string }[]> = {
  cube: [{ key: "side", label: "Side" }],
  prism: [
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "height", label: "Height" },
  ],
  cylinder: [
    { key: "radius", label: "Radius" },
    { key: "height", label: "Height" },
  ],
  sphere: [{ key: "radius", label: "Radius" }],
  cone: [
    { key: "radius", label: "Radius" },
    { key: "height", label: "Height" },
  ],
  pyramid: [
    { key: "length", label: "Base length" },
    { key: "width", label: "Base width" },
    { key: "height", label: "Height" },
  ],
};

export const SHAPE_FORMULAS: Record<Shape, string> = {
  cube: "V = s³",
  prism: "V = l × w × h",
  cylinder: "V = π r² h",
  sphere: "V = (4/3) π r³",
  cone: "V = (1/3) π r² h",
  pyramid: "V = (1/3) l × w × h",
};

/** Volume in cubic units of the entered unit. Returns null for invalid input. */
export function shapeVolume(shape: Shape, dims: Record<string, number>): number | null {
  const keys = SHAPE_FIELDS[shape].map((f) => f.key);
  for (const k of keys) {
    const v = dims[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
  }
  const d = dims;
  switch (shape) {
    case "cube":
      return d.side ** 3;
    case "prism":
      return d.length * d.width * d.height;
    case "cylinder":
      return Math.PI * d.radius ** 2 * d.height;
    case "sphere":
      return (4 / 3) * Math.PI * d.radius ** 3;
    case "cone":
      return (Math.PI * d.radius ** 2 * d.height) / 3;
    case "pyramid":
      return (d.length * d.width * d.height) / 3;
  }
}

export type VolumeConversions = {
  cubicMeters: number;
  liters: number;
  cubicFeet: number;
  cubicYards: number;
  cubicInches: number;
  cubicCentimeters: number;
  usGallons: number;
};

export function convertVolume(volume: number, unit: Unit): VolumeConversions {
  const m3 = volume * METERS_PER_UNIT[unit] ** 3;
  return {
    cubicMeters: m3,
    liters: m3 * 1000,
    cubicFeet: m3 / 0.3048 ** 3,
    cubicYards: m3 / 0.9144 ** 3,
    cubicInches: m3 / 0.0254 ** 3,
    cubicCentimeters: m3 * 1e6,
    usGallons: (m3 * 1000) / 3.785411784,
  };
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-4) return n.toExponential(4);
  return Number(n.toPrecision(7)).toLocaleString("en-US", { maximumFractionDigits: 6 });
}
