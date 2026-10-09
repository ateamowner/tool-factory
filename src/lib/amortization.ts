export const MAX_TERM_MONTHS = 50 * 12;

export type AmortizationInput = {
  loanAmount: number;
  annualRatePercent: number;
  termYears: number;
  extraMonthly: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type AmortizationResult = {
  valid: boolean;
  monthlyPayment: number | null;
  totalInterest: number | null;
  totalPaid: number | null;
  payoffMonths: number | null;
  schedule: AmortizationRow[];
};

const empty: AmortizationResult = {
  valid: false,
  monthlyPayment: null,
  totalInterest: null,
  totalPaid: null,
  payoffMonths: null,
  schedule: [],
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function computeAmortization(input: AmortizationInput): AmortizationResult {
  const { loanAmount, annualRatePercent, termYears } = input;
  const extra = Number.isFinite(input.extraMonthly) && input.extraMonthly > 0 ? input.extraMonthly : 0;
  if (![loanAmount, annualRatePercent, termYears].every(Number.isFinite)) return empty;
  if (loanAmount <= 0 || annualRatePercent < 0 || annualRatePercent > 100 || termYears <= 0) return empty;
  const months = Math.round(termYears * 12);
  if (months < 1 || months > MAX_TERM_MONTHS) return empty;

  const r = annualRatePercent / 100 / 12;
  const payment = round2(monthlyPayment(loanAmount, annualRatePercent, months));
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPaid = 0;
  for (let m = 1; m <= months && balance > 0.004; m++) {
    const interest = round2(balance * r);
    let principal = round2(payment + extra - interest);
    if (principal >= balance || m === months) principal = round2(balance);
    const paid = round2(principal + interest);
    balance = round2(balance - principal);
    totalInterest += interest;
    totalPaid += paid;
    schedule.push({ month: m, payment: paid, principal, interest, balance });
  }
  return {
    valid: true,
    monthlyPayment: payment,
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    payoffMonths: schedule.length,
    schedule,
  };
}
