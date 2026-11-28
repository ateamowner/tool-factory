// Conductor resistance: NEC Chapter 9, Table 8 (Conductor Properties), DC resistance
// at 75 °C in ohms per 1,000 ft. Copper = uncoated stranded; aluminum = stranded.
export type Material = "copper" | "aluminum";
export type Phase = "single" | "three";

export const AWG_SIZES = ["14", "12", "10", "8", "6", "4", "3", "2", "1", "1/0", "2/0", "3/0", "4/0"] as const;
export type Awg = (typeof AWG_SIZES)[number];

export const TABLE_8_OHMS_PER_KFT: Record<Material, Partial<Record<Awg, number>>> = {
  copper: {
    "14": 3.14, "12": 1.98, "10": 1.24, "8": 0.778, "6": 0.491, "4": 0.308, "3": 0.245,
    "2": 0.194, "1": 0.154, "1/0": 0.122, "2/0": 0.0966, "3/0": 0.0766, "4/0": 0.0608,
  },
  aluminum: {
    "12": 3.25, "10": 2.04, "8": 1.28, "6": 0.808, "4": 0.508, "3": 0.403,
    "2": 0.319, "1": 0.253, "1/0": 0.201, "2/0": 0.159, "3/0": 0.126, "4/0": 0.1,
  },
};

export const GUIDELINE_PERCENT = 3;

export function sizesFor(material: Material): Awg[] {
  return AWG_SIZES.filter((s) => TABLE_8_OHMS_PER_KFT[material][s] !== undefined);
}

export type VoltageDropInput = {
  material: Material;
  awg: Awg;
  lengthFt: number;
  amps: number;
  volts: number;
  phase: Phase;
};

export type VoltageDropResult =
  | {
      valid: true;
      ohmsPerKft: number;
      voltsDropped: number;
      percentDrop: number;
      voltageAtLoad: number;
      withinGuideline: boolean;
      smallestAwg: Awg | null;
    }
  | { valid: false; error: string };

function dropFor(r: number, lengthFt: number, amps: number, phase: Phase): number {
  const factor = phase === "three" ? Math.sqrt(3) : 2;
  return (factor * r * lengthFt * amps) / 1000;
}

export function computeVoltageDrop(input: VoltageDropInput): VoltageDropResult {
  const { material, awg, lengthFt, amps, volts, phase } = input;
  const r = TABLE_8_OHMS_PER_KFT[material][awg];
  if (r === undefined) return { valid: false, error: `${awg} AWG is not listed for ${material} in NEC Table 8.` };
  if (![lengthFt, amps, volts].every((n) => Number.isFinite(n))) return { valid: false, error: "Enter numbers for length, amps, and voltage." };
  if (lengthFt <= 0 || amps <= 0 || volts <= 0) return { valid: false, error: "Length, amps, and voltage must be greater than zero." };
  const voltsDropped = dropFor(r, lengthFt, amps, phase);
  const percentDrop = (voltsDropped / volts) * 100;
  let smallestAwg: Awg | null = null;
  const sizes = sizesFor(material);
  for (const size of [...sizes].reverse()) {
    const rs = TABLE_8_OHMS_PER_KFT[material][size] as number;
    if ((dropFor(rs, lengthFt, amps, phase) / volts) * 100 <= GUIDELINE_PERCENT) smallestAwg = size;
    else if (smallestAwg !== null) break;
  }
  return {
    valid: true,
    ohmsPerKft: r,
    voltsDropped,
    percentDrop,
    voltageAtLoad: volts - voltsDropped,
    withinGuideline: percentDrop <= GUIDELINE_PERCENT,
    smallestAwg,
  };
}
