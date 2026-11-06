export const MAX_TERM_YEARS = 50;
export const DEFAULT_MAX_CLTV_PERCENT = 85;

export type HelocInput = {
  homeValue: number;
  firstMortgageBalance: number;
  /** HELOC credit line / limit. */
  helocCreditLimit: number;
  /** Current drawn balance (≤ credit limit). */
  amountDrawn: number;
  /** Annual rate during draw (interest-only) and repayment. */
  drawAprPercent: number;
  drawYears: number;
  repaymentYears: number;
  /** Extra monthly principal during repayment only. */
  extraMonthly: number;
  /** Cap used for “max HELOC from equity” estimate (combined LTV). */
  maxCltvPercent: number;
};

export type HelocScheduleRow = {
  month: number;
  phase: "draw" | "repayment";
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type HelocResult = {
  valid: boolean;
  error: string | null;
  /** First-mortgage LTV %. */
  ltvPercent: number | null;
  /** Combined LTV using credit limit: (mortgage + limit) / home. */
  cltvOnLimitPercent: number | null;
  /** Combined LTV using drawn balance: (mortgage + drawn) / home. */
  cltvOnDrawnPercent: number | null;
  /** Max HELOC line from max CLTV rule: max(0, home*maxCltv - mortgage). */
  maxHelocFromCltv: number | null;
  /** Available undrawn credit on the line. */
  availableCredit: number | null;
  drawMonthlyPayment: number | null;
  repaymentMonthlyPayment: number | null;
  /** Repayment payment − draw payment (positive when payment jumps up). */
  paymentJump: number | null;
  drawPeriodInterest: number | null;
  repaymentInterest: number | null;
  totalInterest: number | null;
  totalPaid: number | null;
  repaymentPayoffMonths: number | null;
  schedule: HelocScheduleRow[];
};

const empty: HelocResult = {
  valid: false,
  error: null,
  ltvPercent: null,
  cltvOnLimitPercent: null,
  cltvOnDrawnPercent: null,
  maxHelocFromCltv: null,
  availableCredit: null,
  drawMonthlyPayment: null,
  repaymentMonthlyPayment: null,
  paymentJump: null,
  drawPeriodInterest: null,
  repaymentInterest: null,
  totalInterest: null,
  totalPaid: null,
  repaymentPayoffMonths: null,
  schedule: [],
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Interest-only monthly payment on a drawn balance. */
export function interestOnlyPayment(balance: number, annualRatePercent: number): number {
  const r = annualRatePercent / 100 / 12;
  return balance * r;
}

/** Fully amortizing monthly payment (principal & interest). */
export function amortizingPayment(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function computeHeloc(input: HelocInput): HelocResult {
  const {
    homeValue,
    firstMortgageBalance,
    helocCreditLimit,
    amountDrawn,
    drawAprPercent,
    drawYears,
    repaymentYears,
  } = input;
  const extra =
    Number.isFinite(input.extraMonthly) && input.extraMonthly > 0 ? input.extraMonthly : 0;
  const maxCltv =
    Number.isFinite(input.maxCltvPercent) && input.maxCltvPercent > 0
      ? input.maxCltvPercent
      : DEFAULT_MAX_CLTV_PERCENT;

  if (
    ![
      homeValue,
      firstMortgageBalance,
      helocCreditLimit,
      amountDrawn,
      drawAprPercent,
      drawYears,
      repaymentYears,
    ].every(Number.isFinite)
  ) {
    return { ...empty, error: "Enter valid numbers for home value, mortgage, HELOC, rate, and terms." };
  }
  if (homeValue <= 0) {
    return { ...empty, error: "Enter a home value greater than zero." };
  }
  if (firstMortgageBalance < 0) {
    return { ...empty, error: "First mortgage balance cannot be negative." };
  }
  if (helocCreditLimit < 0) {
    return { ...empty, error: "HELOC credit limit cannot be negative." };
  }
  if (amountDrawn < 0) {
    return { ...empty, error: "Amount drawn cannot be negative." };
  }
  if (amountDrawn > helocCreditLimit + 0.004) {
    return { ...empty, error: "Amount drawn cannot exceed the HELOC credit limit." };
  }
  if (drawAprPercent < 0 || drawAprPercent > 100) {
    return { ...empty, error: "Enter a draw APR between 0 and 100%." };
  }
  if (drawYears < 0 || drawYears > MAX_TERM_YEARS) {
    return { ...empty, error: "Enter draw years from 0 to 50." };
  }
  if (repaymentYears <= 0 || repaymentYears > MAX_TERM_YEARS) {
    return { ...empty, error: "Enter repayment years greater than 0 and up to 50." };
  }
  if (amountDrawn === 0 && helocCreditLimit === 0) {
    return { ...empty, error: "Enter a HELOC credit limit or amount drawn." };
  }

  const drawMonths = Math.round(drawYears * 12);
  const repaymentMonths = Math.round(repaymentYears * 12);
  if (repaymentMonths < 1) {
    return { ...empty, error: "Repayment term must be at least 1 month." };
  }

  const ltvPercent = round2((firstMortgageBalance / homeValue) * 100);
  const cltvOnLimitPercent = round2(((firstMortgageBalance + helocCreditLimit) / homeValue) * 100);
  const cltvOnDrawnPercent = round2(((firstMortgageBalance + amountDrawn) / homeValue) * 100);
  const maxHelocFromCltv = round2(Math.max(0, (homeValue * maxCltv) / 100 - firstMortgageBalance));
  const availableCredit = round2(Math.max(0, helocCreditLimit - amountDrawn));

  const drawMonthly = round2(interestOnlyPayment(amountDrawn, drawAprPercent));
  const repaymentMonthly = round2(amortizingPayment(amountDrawn, drawAprPercent, repaymentMonths));

  const schedule: HelocScheduleRow[] = [];
  let balance = amountDrawn;
  let totalInterest = 0;
  let totalPaid = 0;
  const r = drawAprPercent / 100 / 12;

  // Draw period: interest-only on drawn balance (principal unchanged).
  for (let m = 1; m <= drawMonths && amountDrawn > 0; m++) {
    const interest = round2(balance * r);
    const payment = interest;
    totalInterest += interest;
    totalPaid += payment;
    schedule.push({
      month: m,
      phase: "draw",
      payment,
      principal: 0,
      interest,
      balance: round2(balance),
    });
  }

  // Repayment period: fully amortizing on remaining drawn balance.
  let repaymentPayoffMonths = 0;
  let repaymentInterest = 0;
  if (amountDrawn > 0) {
    const startMonth = schedule.length;
    for (let i = 1; i <= repaymentMonths && balance > 0.004; i++) {
      const interest = round2(balance * r);
      let principal = round2(repaymentMonthly + extra - interest);
      if (principal >= balance || i === repaymentMonths) principal = round2(balance);
      if (principal < 0) principal = 0;
      const paid = round2(principal + interest);
      balance = round2(balance - principal);
      totalInterest += interest;
      repaymentInterest += interest;
      totalPaid += paid;
      repaymentPayoffMonths = i;
      schedule.push({
        month: startMonth + i,
        phase: "repayment",
        payment: paid,
        principal,
        interest,
        balance,
      });
    }
  }

  const drawInterestFromSchedule = round2(
    schedule.filter((row) => row.phase === "draw").reduce((sum, row) => sum + row.interest, 0),
  );

  return {
    valid: true,
    error: null,
    ltvPercent,
    cltvOnLimitPercent,
    cltvOnDrawnPercent,
    maxHelocFromCltv,
    availableCredit,
    drawMonthlyPayment: drawMonthly,
    repaymentMonthlyPayment: repaymentMonthly,
    paymentJump: round2(repaymentMonthly - drawMonthly),
    drawPeriodInterest: drawInterestFromSchedule,
    repaymentInterest: round2(repaymentInterest),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    repaymentPayoffMonths: amountDrawn > 0 ? repaymentPayoffMonths : 0,
    schedule,
  };
}
