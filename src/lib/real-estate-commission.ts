export type RealEstateCommissionInput = {
  salePrice: number;
  commissionRatePercent: number;
  listingSplitPercent: number;
  buyerSplitPercent: number;
  additionalFees: number;
};

export type RealEstateCommissionResult = {
  valid: boolean;
  salePrice: number | null;
  commissionRatePercent: number | null;
  listingSplitPercent: number | null;
  buyerSplitPercent: number | null;
  totalCommission: number | null;
  listingSide: number | null;
  buyerSide: number | null;
  listingRateOfPrice: number | null;
  buyerRateOfPrice: number | null;
  additionalFees: number | null;
  commissionPlusFees: number | null;
  sellerNetProceeds: number | null;
};

const emptyResult: RealEstateCommissionResult = {
  valid: false,
  salePrice: null,
  commissionRatePercent: null,
  listingSplitPercent: null,
  buyerSplitPercent: null,
  totalCommission: null,
  listingSide: null,
  buyerSide: null,
  listingRateOfPrice: null,
  buyerRateOfPrice: null,
  additionalFees: null,
  commissionPlusFees: null,
  sellerNetProceeds: null,
};

const SPLIT_SUM_TOLERANCE = 0.01;

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function splitSumsToHundred(
  listingSplitPercent: number,
  buyerSplitPercent: number,
): boolean {
  if (!isFiniteNumber(listingSplitPercent) || !isFiniteNumber(buyerSplitPercent)) {
    return false;
  }
  return Math.abs(listingSplitPercent + buyerSplitPercent - 100) <= SPLIT_SUM_TOLERANCE;
}

export function computeRealEstateCommission(
  input: RealEstateCommissionInput,
): RealEstateCommissionResult {
  const saleOk = isFiniteNumber(input.salePrice) && input.salePrice > 0;
  const rateOk =
    isFiniteNumber(input.commissionRatePercent) &&
    input.commissionRatePercent >= 0 &&
    input.commissionRatePercent <= 100;
  const listingOk =
    isFiniteNumber(input.listingSplitPercent) &&
    input.listingSplitPercent >= 0 &&
    input.listingSplitPercent <= 100;
  const buyerOk =
    isFiniteNumber(input.buyerSplitPercent) &&
    input.buyerSplitPercent >= 0 &&
    input.buyerSplitPercent <= 100;
  const feesOk = isFiniteNumber(input.additionalFees) && input.additionalFees >= 0;

  if (
    !saleOk ||
    !rateOk ||
    !listingOk ||
    !buyerOk ||
    !feesOk ||
    !splitSumsToHundred(input.listingSplitPercent, input.buyerSplitPercent)
  ) {
    return emptyResult;
  }

  const totalCommission = input.salePrice * (input.commissionRatePercent / 100);
  const listingSide = totalCommission * (input.listingSplitPercent / 100);
  const buyerSide = totalCommission * (input.buyerSplitPercent / 100);
  const commissionPlusFees = totalCommission + input.additionalFees;
  const sellerNetProceeds = input.salePrice - commissionPlusFees;

  return {
    valid: true,
    salePrice: input.salePrice,
    commissionRatePercent: input.commissionRatePercent,
    listingSplitPercent: input.listingSplitPercent,
    buyerSplitPercent: input.buyerSplitPercent,
    totalCommission,
    listingSide,
    buyerSide,
    listingRateOfPrice: input.commissionRatePercent * (input.listingSplitPercent / 100),
    buyerRateOfPrice: input.commissionRatePercent * (input.buyerSplitPercent / 100),
    additionalFees: input.additionalFees,
    commissionPlusFees,
    sellerNetProceeds,
  };
}
