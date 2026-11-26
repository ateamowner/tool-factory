export type NetWorthInput = {
  cash: number;
  investments: number;
  retirement: number;
  home: number;
  vehicles: number;
  otherAssets: number;
  mortgage: number;
  loans: number;
  creditCards: number;
  otherDebts: number;
};

export type NetWorthResult =
  | { valid: false; error: string }
  | {
      valid: true;
      totalAssets: number;
      totalDebts: number;
      netWorth: number;
      /** Total assets divided by total debts; null when there are no debts. */
      assetToDebtRatio: number | null;
      /** Total debts divided by total assets; null when there are no assets. */
      debtToAssetRatio: number | null;
    };

export const ASSET_FIELDS = ["cash", "investments", "retirement", "home", "vehicles", "otherAssets"] as const;
export const DEBT_FIELDS = ["mortgage", "loans", "creditCards", "otherDebts"] as const;

export function roundTo(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round((n + Number.EPSILON) * f) / f;
}

export function computeNetWorth(input: NetWorthInput): NetWorthResult {
  for (const key of [...ASSET_FIELDS, ...DEBT_FIELDS]) {
    const v = input[key];
    if (!Number.isFinite(v) || v < 0) {
      return { valid: false, error: "Enter each amount as a number of 0 or more." };
    }
  }
  const totalAssets = roundTo(ASSET_FIELDS.reduce((s, k) => s + input[k], 0), 2);
  const totalDebts = roundTo(DEBT_FIELDS.reduce((s, k) => s + input[k], 0), 2);
  return {
    valid: true,
    totalAssets,
    totalDebts,
    netWorth: roundTo(totalAssets - totalDebts, 2),
    assetToDebtRatio: totalDebts > 0 ? roundTo(totalAssets / totalDebts, 2) : null,
    debtToAssetRatio: totalAssets > 0 ? roundTo(totalDebts / totalAssets, 4) : null,
  };
}
