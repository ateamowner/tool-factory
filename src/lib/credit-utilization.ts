export type CreditCardInput = {
  label?: string;
  limit: number;
  balance: number;
};

export type CreditCardUtilization = {
  label: string;
  limit: number;
  balance: number;
  utilizationPercent: number;
  availableCredit: number;
  amountToPayForTarget: number | null;
};

export type CreditUtilizationInput = {
  cards: CreditCardInput[];
  targetUtilizationPercent: number;
};

export type CreditUtilizationResult = {
  valid: boolean;
  totalLimit: number | null;
  totalBalance: number | null;
  utilizationPercent: number | null;
  availableCredit: number | null;
  overLimitAmount: number | null;
  targetUtilizationPercent: number | null;
  targetBalance: number | null;
  amountToPayForTarget: number | null;
  alreadyAtOrBelowTarget: boolean;
  cards: CreditCardUtilization[];
};

export const DEFAULT_TARGET_UTILIZATION_PERCENT = 30;
export const TARGET_UTILIZATION_PRESETS = [10, 30, 50] as const;

const emptyResult: CreditUtilizationResult = {
  valid: false,
  totalLimit: null,
  totalBalance: null,
  utilizationPercent: null,
  availableCredit: null,
  overLimitAmount: null,
  targetUtilizationPercent: null,
  targetBalance: null,
  amountToPayForTarget: null,
  alreadyAtOrBelowTarget: false,
  cards: [],
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function isValidTargetUtilizationPercent(value: number): boolean {
  return isFiniteNumber(value) && value >= 0 && value <= 100;
}

export function utilizationPercent(balance: number, limit: number): number | null {
  if (!isFiniteNumber(balance) || !isFiniteNumber(limit) || limit <= 0) return null;
  if (balance < 0) return null;
  return (balance / limit) * 100;
}

export function availableCredit(limit: number, balance: number): number {
  return Math.max(0, limit - balance);
}

export function amountToReachTarget(
  balance: number,
  limit: number,
  targetUtilizationPercent: number,
): number | null {
  if (!isFiniteNumber(balance) || balance < 0) return null;
  if (!isFiniteNumber(limit) || limit <= 0) return null;
  if (!isValidTargetUtilizationPercent(targetUtilizationPercent)) return null;
  const targetBalance = limit * (targetUtilizationPercent / 100);
  return Math.max(0, balance - targetBalance);
}

export function validCards(cards: CreditCardInput[]): CreditCardInput[] {
  return cards.filter(
    (card) =>
      isFiniteNumber(card.limit) &&
      card.limit > 0 &&
      isFiniteNumber(card.balance) &&
      card.balance >= 0,
  );
}

export function computeCreditUtilization(
  input: CreditUtilizationInput,
): CreditUtilizationResult {
  const cards = validCards(input.cards);
  if (cards.length === 0) return emptyResult;

  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const overallUtilization = utilizationPercent(totalBalance, totalLimit);
  if (overallUtilization === null) return emptyResult;

  const targetOk = isValidTargetUtilizationPercent(input.targetUtilizationPercent);
  const targetUtilizationPercent = targetOk ? input.targetUtilizationPercent : null;
  const targetBalance = targetOk
    ? totalLimit * (input.targetUtilizationPercent / 100)
    : null;
  const paydown = targetOk
    ? amountToReachTarget(totalBalance, totalLimit, input.targetUtilizationPercent)
    : null;

  return {
    valid: true,
    totalLimit,
    totalBalance,
    utilizationPercent: overallUtilization,
    availableCredit: availableCredit(totalLimit, totalBalance),
    overLimitAmount: Math.max(0, totalBalance - totalLimit),
    targetUtilizationPercent,
    targetBalance,
    amountToPayForTarget: paydown,
    alreadyAtOrBelowTarget: paydown === 0,
    cards: cards.map((card, index) => ({
      label: card.label?.trim() || `Card ${index + 1}`,
      limit: card.limit,
      balance: card.balance,
      utilizationPercent: utilizationPercent(card.balance, card.limit) ?? 0,
      availableCredit: availableCredit(card.limit, card.balance),
      amountToPayForTarget: targetOk
        ? amountToReachTarget(card.balance, card.limit, input.targetUtilizationPercent)
        : null,
    })),
  };
}
