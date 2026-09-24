export type BottleneckStepInput = {
  name: string;
  capacity: number;
};

export type BottleneckStepResult = {
  index: number;
  name: string;
  capacity: number;
  /** Throughput ÷ this step's capacity, as a percent. The bottleneck is 100. */
  utilizationPercent: number;
  /** Capacity this step cannot use while the line runs at the bottleneck rate. */
  idleCapacity: number;
  isBottleneck: boolean;
};

export type BottleneckStatus = "ok" | "invalid";

export type BottleneckResult = {
  status: BottleneckStatus;
  valid: boolean;
  error: string | null;
  /** Finished units per period. Equals the lowest step capacity. */
  throughput: number | null;
  bottleneckNames: string[];
  steps: BottleneckStepResult[];
};

const emptyResult = (error: string): BottleneckResult => ({
  status: "invalid",
  valid: false,
  error,
  throughput: null,
  bottleneckNames: [],
  steps: [],
});

/** Strip thousands separators. Empty input is NaN so callers can reject it. */
export function parseBottleneckCapacity(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function stepDisplayName(name: string, index: number): string {
  const trimmed = name.trim();
  return trimmed || `Step ${index + 1}`;
}

function isValidCapacity(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Theory of Constraints bottleneck: the lowest capacity limits the line.
 * System throughput equals that capacity. Utilization of each step is
 * throughput ÷ step capacity.
 */
export function computeBottleneck(steps: BottleneckStepInput[]): BottleneckResult {
  if (steps.length === 0) {
    return emptyResult("Add at least one step with a capacity greater than 0.");
  }

  if (steps.some((step) => !isValidCapacity(step.capacity))) {
    return emptyResult("Each capacity must be a number greater than 0.");
  }

  const throughput = Math.min(...steps.map((step) => step.capacity));
  const results: BottleneckStepResult[] = steps.map((step, index) => ({
    index,
    name: stepDisplayName(step.name, index),
    capacity: step.capacity,
    utilizationPercent: (throughput / step.capacity) * 100,
    idleCapacity: step.capacity - throughput,
    isBottleneck: nearlyEqual(step.capacity, throughput),
  }));

  return {
    status: "ok",
    valid: true,
    error: null,
    throughput,
    bottleneckNames: results.filter((step) => step.isBottleneck).map((step) => step.name),
    steps: results,
  };
}
