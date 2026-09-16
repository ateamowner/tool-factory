export const MAX_USEFUL_LIFE_YEARS = 100;
export const MONEY_EPSILON = 1e-8;
export const LIFE_EPSILON = 1e-9;

export type StraightLineDepreciationStatus =
  | "ok"
  | "invalid"
  | "salvage_exceeds_cost"
  | "invalid_fraction"
  | "life_too_long";

export type StraightLineDepreciationInput = {
  cost: number;
  salvage: number;
  usefulLifeYears: number;
  firstYearFraction: number;
};

export type StraightLineScheduleRow = {
  year: number;
  beginningBookValue: number;
  depreciation: number;
  endingBookValue: number;
  yearFraction: number;
};

export type StraightLineDepreciationResult = {
  status: StraightLineDepreciationStatus;
  valid: boolean;
  error: string | null;
  cost: number | null;
  salvage: number | null;
  usefulLifeYears: number | null;
  firstYearFraction: number | null;
  depreciableBasis: number | null;
  annualDepreciation: number | null;
  monthlyDepreciation: number | null;
  totalDepreciation: number | null;
  schedule: StraightLineScheduleRow[];
};

const emptyResult = (
  status: StraightLineDepreciationStatus,
  error: string,
): StraightLineDepreciationResult => ({
  status,
  valid: false,
  error,
  cost: null,
  salvage: null,
  usefulLifeYears: null,
  firstYearFraction: null,
  depreciableBasis: null,
  annualDepreciation: null,
  monthlyDepreciation: null,
  totalDepreciation: null,
  schedule: [],
});

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Remaining calendar-year fraction from a YYYY-MM-DD placed-in-service date. */
export function yearFractionFromPlacedInService(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const yearStart = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);
  const placed = Date.UTC(year, month - 1, day);
  const daysInYear = (yearEnd - yearStart) / 86_400_000 + 1;
  const remainingInclusive = (yearEnd - placed) / 86_400_000 + 1;
  if (daysInYear <= 0 || remainingInclusive <= 0) return null;
  return remainingInclusive / daysInYear;
}

export function computeStraightLineDepreciation(
  input: StraightLineDepreciationInput,
): StraightLineDepreciationResult {
  const costOk = isFiniteNumber(input.cost) && input.cost >= 0;
  const salvageOk = isFiniteNumber(input.salvage) && input.salvage >= 0;
  const lifeOk = isFiniteNumber(input.usefulLifeYears) && input.usefulLifeYears > 0;
  const fractionOk =
    isFiniteNumber(input.firstYearFraction) &&
    input.firstYearFraction > 0 &&
    input.firstYearFraction <= 1;

  if (!costOk || !salvageOk || !lifeOk) {
    return emptyResult(
      "invalid",
      "Enter a non-negative asset cost, a salvage value of 0 or more, and a useful life greater than 0 years.",
    );
  }

  if (input.salvage > input.cost) {
    return emptyResult(
      "salvage_exceeds_cost",
      "Salvage (residual) value cannot be greater than asset cost.",
    );
  }

  if (!fractionOk) {
    return emptyResult(
      "invalid_fraction",
      "First-year fraction must be greater than 0 and at most 1 (a full year).",
    );
  }

  if (input.usefulLifeYears > MAX_USEFUL_LIFE_YEARS) {
    return emptyResult(
      "life_too_long",
      `Useful life must be at most ${MAX_USEFUL_LIFE_YEARS} years so the schedule stays readable.`,
    );
  }

  const cost = input.cost;
  const salvage = input.salvage;
  const usefulLifeYears = input.usefulLifeYears;
  const firstYearFraction = input.firstYearFraction;
  const depreciableBasis = cost - salvage;
  const annualDepreciation = depreciableBasis / usefulLifeYears;
  const monthlyDepreciation = annualDepreciation / 12;

  let remainingLife = usefulLifeYears;
  let remainingBasis = depreciableBasis;
  let begin = cost;
  let year = 1;
  const schedule: StraightLineScheduleRow[] = [];

  while (remainingLife > LIFE_EPSILON) {
    const fraction =
      year === 1
        ? Math.min(firstYearFraction, remainingLife)
        : Math.min(1, remainingLife);
    const lifeLeftAfter = remainingLife - fraction;
    const isLast = lifeLeftAfter <= LIFE_EPSILON;

    let depreciation = annualDepreciation * fraction;
    if (isLast || depreciation > remainingBasis - MONEY_EPSILON) {
      depreciation = remainingBasis;
    }
    if (depreciation < 0) depreciation = 0;
    if (depreciation > remainingBasis) depreciation = remainingBasis;

    const endingBookValue = isLast ? salvage : begin - depreciation;

    schedule.push({
      year,
      beginningBookValue: begin,
      depreciation,
      endingBookValue,
      yearFraction: fraction,
    });

    remainingBasis -= depreciation;
    if (remainingBasis < MONEY_EPSILON) remainingBasis = 0;
    remainingLife = lifeLeftAfter;
    begin = endingBookValue;
    year += 1;

    if (year > 250) break;
  }

  const totalDepreciation = schedule.reduce((sum, row) => sum + row.depreciation, 0);

  return {
    status: "ok",
    valid: true,
    error: null,
    cost,
    salvage,
    usefulLifeYears,
    firstYearFraction,
    depreciableBasis,
    annualDepreciation,
    monthlyDepreciation,
    totalDepreciation,
    schedule,
  };
}
