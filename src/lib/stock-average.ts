export type LotInput = {
  shares: number;
  price: number;
  fee: number;
};

export type StockAverageResult = {
  totalShares: number;
  totalInvested: number;
  costBasisWithoutFees: number;
  totalFees: number;
  weightedAverageCost: number | null;
  averagePriceWithoutFees: number | null;
  breakEvenPrice: number | null;
  marketValue: number | null;
  unrealizedPL: number | null;
  unrealizedPLPercent: number | null;
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function computeStockAverage(
  lots: LotInput[],
  currentPrice?: number | null,
): StockAverageResult {
  const validLots = lots.filter(
    (lot) =>
      isFiniteNumber(lot.shares) &&
      lot.shares > 0 &&
      isFiniteNumber(lot.price) &&
      lot.price >= 0 &&
      isFiniteNumber(lot.fee) &&
      lot.fee >= 0,
  );

  const totalShares = validLots.reduce((sum, lot) => sum + lot.shares, 0);
  const costBasisWithoutFees = validLots.reduce(
    (sum, lot) => sum + lot.shares * lot.price,
    0,
  );
  const totalFees = validLots.reduce((sum, lot) => sum + lot.fee, 0);
  const totalInvested = costBasisWithoutFees + totalFees;

  const weightedAverageCost =
    totalShares > 0 ? totalInvested / totalShares : null;
  const averagePriceWithoutFees =
    totalShares > 0 ? costBasisWithoutFees / totalShares : null;
  const breakEvenPrice = weightedAverageCost;

  const hasCurrent =
    currentPrice !== null &&
    currentPrice !== undefined &&
    isFiniteNumber(currentPrice) &&
    currentPrice >= 0 &&
    totalShares > 0;

  const marketValue = hasCurrent ? currentPrice * totalShares : null;
  const unrealizedPL =
    marketValue !== null ? marketValue - totalInvested : null;
  const unrealizedPLPercent =
    unrealizedPL !== null && totalInvested > 0
      ? (unrealizedPL / totalInvested) * 100
      : null;

  return {
    totalShares,
    totalInvested,
    costBasisWithoutFees,
    totalFees,
    weightedAverageCost,
    averagePriceWithoutFees,
    breakEvenPrice,
    marketValue,
    unrealizedPL,
    unrealizedPLPercent,
  };
}

export function lotCost(lot: LotInput): number | null {
  if (
    !isFiniteNumber(lot.shares) ||
    lot.shares < 0 ||
    !isFiniteNumber(lot.price) ||
    lot.price < 0 ||
    !isFiniteNumber(lot.fee) ||
    lot.fee < 0
  ) {
    return null;
  }
  return lot.shares * lot.price + lot.fee;
}
