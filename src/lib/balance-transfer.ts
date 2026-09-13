export const MAX_PAYOFF_MONTHS = 50 * 12;
export const MAX_PROMO_MONTHS = 10 * 12;

export type BalanceTransferInput = {
  currentBalance: number;
  currentAprPercent: number;
  monthlyPayment: number;
  transferFeePercent: number;
  transferFeeFlat: number;
  promoAprPercent: number;
  promoLengthMonths: number;
  regularAprPercent: number;
};

export type PayoffSimulation = {
  monthsToPayoff: number | null;
  totalInterest: number;
  neverPaysOff: boolean;
  endingBalance: number;
};

export type BalanceTransferResult = {
  valid: boolean;
  transferFee: number | null;
  startingBalanceAfterFee: number | null;
  transferMonthsToPayoff: number | null;
  paidOffDuringPromo: boolean;
  willNotFinishInPromo: boolean;
  transferTotalInterest: number | null;
  transferTotalCost: number | null;
  stayMonthsToPayoff: number | null;
  stayTotalInterest: number | null;
  estimatedSavings: number | null;
  stayNeverPaysOff: boolean;
  transferNeverPaysOff: boolean;
  paymentTooLow: boolean;
};

const emptyResult: BalanceTransferResult = {
  valid: false,
  transferFee: null,
  startingBalanceAfterFee: null,
  transferMonthsToPayoff: null,
  paidOffDuringPromo: false,
  willNotFinishInPromo: false,
  transferTotalInterest: null,
  transferTotalCost: null,
  stayMonthsToPayoff: null,
  stayTotalInterest: null,
  estimatedSavings: null,
  stayNeverPaysOff: false,
  transferNeverPaysOff: false,
  paymentTooLow: false,
};

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function monthlyInterestRate(aprPercent: number): number {
  return aprPercent / 100 / 12;
}

export function transferFeeAmount(
  balance: number,
  feePercent: number,
  feeFlat: number,
): number {
  return balance * (feePercent / 100) + feeFlat;
}

export function clampPromoLengthMonths(months: number): number | null {
  if (!isFiniteNumber(months)) return null;
  const rounded = Math.round(months);
  if (rounded < 0 || rounded > MAX_PROMO_MONTHS) return null;
  return rounded;
}

export function simulateRevolvingPayoff(
  startingBalance: number,
  monthlyPayment: number,
  aprPercentForMonth: (zeroBasedMonth: number) => number,
  maxMonths = MAX_PAYOFF_MONTHS,
): PayoffSimulation {
  if (!isFiniteNumber(startingBalance) || startingBalance < 0) {
    return {
      monthsToPayoff: null,
      totalInterest: 0,
      neverPaysOff: true,
      endingBalance: startingBalance,
    };
  }
  if (!isFiniteNumber(monthlyPayment) || monthlyPayment <= 0) {
    return {
      monthsToPayoff: null,
      totalInterest: 0,
      neverPaysOff: true,
      endingBalance: startingBalance,
    };
  }
  if (startingBalance === 0) {
    return {
      monthsToPayoff: 0,
      totalInterest: 0,
      neverPaysOff: false,
      endingBalance: 0,
    };
  }

  let balance = startingBalance;
  let totalInterest = 0;

  for (let month = 1; month <= maxMonths; month++) {
    const apr = aprPercentForMonth(month - 1);
    if (!isFiniteNumber(apr) || apr < 0) {
      return {
        monthsToPayoff: null,
        totalInterest,
        neverPaysOff: true,
        endingBalance: balance,
      };
    }

    const interest = balance * monthlyInterestRate(apr);
    const due = balance + interest;

    if (monthlyPayment + 1e-9 >= due) {
      totalInterest += interest;
      return {
        monthsToPayoff: month,
        totalInterest,
        neverPaysOff: false,
        endingBalance: 0,
      };
    }

    totalInterest += interest;
    balance = due - monthlyPayment;
  }

  return {
    monthsToPayoff: null,
    totalInterest,
    neverPaysOff: true,
    endingBalance: balance,
  };
}

export function computeBalanceTransfer(
  input: BalanceTransferInput,
): BalanceTransferResult {
  const promoLengthMonths = clampPromoLengthMonths(input.promoLengthMonths);
  const balanceOk = isFiniteNumber(input.currentBalance) && input.currentBalance > 0;
  const currentAprOk =
    isFiniteNumber(input.currentAprPercent) && input.currentAprPercent >= 0;
  const paymentOk = isFiniteNumber(input.monthlyPayment) && input.monthlyPayment > 0;
  const feePercentOk =
    isFiniteNumber(input.transferFeePercent) && input.transferFeePercent >= 0;
  const feeFlatOk = isFiniteNumber(input.transferFeeFlat) && input.transferFeeFlat >= 0;
  const promoAprOk = isFiniteNumber(input.promoAprPercent) && input.promoAprPercent >= 0;
  const regularAprOk =
    isFiniteNumber(input.regularAprPercent) && input.regularAprPercent >= 0;

  if (
    !balanceOk ||
    !currentAprOk ||
    !paymentOk ||
    !feePercentOk ||
    !feeFlatOk ||
    !promoAprOk ||
    !regularAprOk ||
    promoLengthMonths === null
  ) {
    return emptyResult;
  }

  const transferFee = transferFeeAmount(
    input.currentBalance,
    input.transferFeePercent,
    input.transferFeeFlat,
  );
  const startingBalanceAfterFee = input.currentBalance + transferFee;

  const stay = simulateRevolvingPayoff(
    input.currentBalance,
    input.monthlyPayment,
    () => input.currentAprPercent,
  );
  const transfer = simulateRevolvingPayoff(
    startingBalanceAfterFee,
    input.monthlyPayment,
    (zeroBasedMonth) =>
      zeroBasedMonth < promoLengthMonths
        ? input.promoAprPercent
        : input.regularAprPercent,
  );

  const paidOffDuringPromo =
    transfer.monthsToPayoff !== null &&
    promoLengthMonths > 0 &&
    transfer.monthsToPayoff <= promoLengthMonths;
  const willNotFinishInPromo = promoLengthMonths > 0 && !paidOffDuringPromo;
  const bothPayOff = !stay.neverPaysOff && !transfer.neverPaysOff;
  const transferTotalCost = transfer.totalInterest + transferFee;

  return {
    valid: true,
    transferFee,
    startingBalanceAfterFee,
    transferMonthsToPayoff: transfer.monthsToPayoff,
    paidOffDuringPromo,
    willNotFinishInPromo,
    transferTotalInterest: transfer.neverPaysOff ? null : transfer.totalInterest,
    transferTotalCost: transfer.neverPaysOff ? null : transferTotalCost,
    stayMonthsToPayoff: stay.monthsToPayoff,
    stayTotalInterest: stay.neverPaysOff ? null : stay.totalInterest,
    estimatedSavings: bothPayOff ? stay.totalInterest - transferTotalCost : null,
    stayNeverPaysOff: stay.neverPaysOff,
    transferNeverPaysOff: transfer.neverPaysOff,
    paymentTooLow: stay.neverPaysOff || transfer.neverPaysOff,
  };
}
