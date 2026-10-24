/** Parse a user-entered number, allowing commas and spaces. Blank returns 0; invalid returns null. */
function parseNumberInput(raw: unknown): number | null {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Planning defaults (products vary). */
export const DEFAULT_TILE_LENGTH_IN = 12;
export const DEFAULT_TILE_WIDTH_IN = 12;
export const DEFAULT_GROUT_IN = 0.125; // 1/8 in
export const DEFAULT_TILES_PER_BOX = 10;

export type TileInput = {
  mode: "area" | "dimensions";
  areaSqFt: string;
  length: string;
  width: string;
  tileLengthIn: string;
  tileWidthIn: string;
  groutIn: string;
  wastePercent: string;
  tilesPerBox: string;
};

export type TileResult =
  | {
      valid: true;
      baseSqFt: number;
      sqFtWithWaste: number;
      tileSqFt: number;
      tilesExact: number;
      tiles: number;
      boxes: number;
      boxSqFt: number;
    }
  | { valid: false; error: string };

/** Square feet one tile covers, including half a grout joint on each side. */
export function tileCoverageSqFt(lengthIn: number, widthIn: number, groutIn: number): number {
  if (lengthIn <= 0 || widthIn <= 0 || groutIn < 0) return 0;
  return ((lengthIn + groutIn) * (widthIn + groutIn)) / 144;
}

export function roundUp(n: number): number {
  if (n <= 0) return 0;
  return Math.ceil(n - 1e-9);
}

export function computeTile(input: TileInput): TileResult {
  const nums = [
    input.areaSqFt,
    input.length,
    input.width,
    input.tileLengthIn,
    input.tileWidthIn,
    input.groutIn,
    input.wastePercent,
    input.tilesPerBox,
  ].map(parseNumberInput);
  if (nums.some((n) => n === null)) return { valid: false, error: "Enter numbers only." };
  const [area, length, width, tileL, tileW, grout, waste, perBox] = nums as number[];
  if (area < 0 || length < 0 || width < 0) return { valid: false, error: "Sizes can't be negative." };
  if (tileL <= 0 || tileW <= 0) return { valid: false, error: "Enter the tile length and width in inches." };
  if (grout < 0 || grout > 2) return { valid: false, error: "Grout gap must be between 0 and 2 inches." };
  if (waste < 0 || waste > 100) return { valid: false, error: "Waste must be between 0 and 100%." };
  if (perBox < 0) return { valid: false, error: "Tiles per box can't be negative." };
  const baseSqFt = input.mode === "area" ? area : length * width;
  if (baseSqFt <= 0) return { valid: false, error: "Enter the floor or wall area or its length and width." };
  const sqFtWithWaste = baseSqFt * (1 + waste / 100);
  const tileSqFt = tileCoverageSqFt(tileL, tileW, grout);
  const tilesExact = sqFtWithWaste / tileSqFt;
  const tiles = roundUp(tilesExact);
  const boxes = perBox > 0 ? roundUp(tiles / perBox) : 0;
  return {
    valid: true,
    baseSqFt,
    sqFtWithWaste,
    tileSqFt,
    tilesExact,
    tiles,
    boxes,
    boxSqFt: perBox > 0 ? ((tileL * tileW) / 144) * perBox : 0,
  };
}
