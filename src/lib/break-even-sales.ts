export type BreakEvenSalesInput = {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  targetProfit: number | null;
};

export type BreakEvenSalesStatus = "ok" | "invalid" | "unreachable";

export type BreakEvenSalesResult = {
  status: BreakEvenSalesStatus;
  valid: boolean;
  fixedCosts: number | null;
  variableCostPerUnit: number | null;
  sellingPricePerUnit: number | null;
  contributionMargin: number | null;
  contributionMarginPercent: number | null;
  contributionMarginRatio: number | null;
  breakEvenUnitsExact: number | null;
  breakEvenUnits: number | null;
  breakEvenSales: number | null;
  breakEvenSalesFromRatio: number | null;
  hasTargetProfit: boolean;
  targetProfit: number | null;
  targetUnitsExact: number | null;
  targetUnits: number | null;
  targetSales: number | null;
};

const emptyResult: BreakEvenSalesResult = {
  status: "invalid",
  valid: false,
  fixedCosts: null,
  variableCostPerUnit: null,
  sellingPricePerUnit: null,
  contributionMargin: null,
  contributionMarginPercent: null,
  contributionMarginRatio: null,
  breakEvenUnitsExact: null,
  breakEvenUnits: null,
  breakEvenSales: null,
  breakEvenSalesFromRatio: null,
  hasTargetProfit: false,
  targetProfit: null,
  targetUnitsExact: null,
  targetUnits: null,
  targetSales: null,
};

const UNIT_EPSILON = 1e-9;

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

/** Whole units to sell: ceil the exact figure, treating near-integers as exact. */
export function ceilUnits(exact: number): number {
  if (!isFiniteNumber(exact) || exact <= 0) return 0;
  const nearest = Math.round(exact);
  if (Math.abs(exact - nearest) < UNIT_EPSILON) return nearest;
  return Math.ceil(exact);
}

export function computeBreakEvenSales(input: BreakEvenSalesInput): BreakEvenSalesResult {
  const fixedOk = isFiniteNumber(input.fixedCosts) && input.fixedCosts >= 0;
  const variableOk =
    isFiniteNumber(input.variableCostPerUnit) && input.variableCostPerUnit >= 0;
  const priceOk =
    isFiniteNumber(input.sellingPricePerUnit) && input.sellingPricePerUnit > 0;

  const hasTarget =
    input.targetProfit !== null &&
    input.targetProfit !== undefined &&
    !(typeof input.targetProfit === "number" && Number.isNaN(input.targetProfit));
  const targetOk = !hasTarget || (isFiniteNumber(input.targetProfit!) && input.targetProfit! >= 0);

  if (!fixedOk || !variableOk || !priceOk || !targetOk) {
    return emptyResult;
  }

  const fixedCosts = input.fixedCosts;
  const variableCostPerUnit = input.variableCostPerUnit;
  const sellingPricePerUnit = input.sellingPricePerUnit;
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  const contributionMarginRatio = contributionMargin / sellingPricePerUnit;
  const contributionMarginPercent = contributionMarginRatio * 100;

  if (contributionMargin <= 0) {
    return {
      ...emptyResult,
      status: "unreachable",
      fixedCosts,
      variableCostPerUnit,
      sellingPricePerUnit,
      contributionMargin,
      contributionMarginPercent,
      contributionMarginRatio,
      hasTargetProfit: hasTarget,
      targetProfit: hasTarget ? input.targetProfit : null,
    };
  }

  const breakEvenUnitsExact = fixedCosts / contributionMargin;
  const breakEvenUnits = ceilUnits(breakEvenUnitsExact);
  const breakEvenSalesFromRatio = fixedCosts / contributionMarginRatio;
  const breakEvenSales = breakEvenUnits * sellingPricePerUnit;

  const targetProfit = hasTarget ? input.targetProfit! : null;
  let targetUnitsExact: number | null = null;
  let targetUnits: number | null = null;
  let targetSales: number | null = null;

  if (targetProfit !== null) {
    targetUnitsExact = (fixedCosts + targetProfit) / contributionMargin;
    targetUnits = ceilUnits(targetUnitsExact);
    targetSales = targetUnits * sellingPricePerUnit;
  }

  return {
    status: "ok",
    valid: true,
    fixedCosts,
    variableCostPerUnit,
    sellingPricePerUnit,
    contributionMargin,
    contributionMarginPercent,
    contributionMarginRatio,
    breakEvenUnitsExact,
    breakEvenUnits,
    breakEvenSales,
    breakEvenSalesFromRatio,
    hasTargetProfit: hasTarget,
    targetProfit,
    targetUnitsExact,
    targetUnits,
    targetSales,
  };
}
