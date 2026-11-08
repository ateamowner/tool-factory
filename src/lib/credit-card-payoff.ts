export type PayoffMode = "payment" | "months";

export interface CreditCardPayoffInput {
  mode: PayoffMode;
  /** Current card balance in dollars. */
  balance: number;
  /** Annual percentage rate, e.g. 22.99. */
  apr: number;
  /** Fixed monthly payment (mode "payment"). */
  monthlyPayment: number;
  /** Months until debt-free (mode "months"). */
  months: number;
}

export type CreditCardPayoffResult =
  | {
      valid: true;
      months: number;
      monthlyPayment: number;
      lastPayment: number;
      totalInterest: number;
      totalPaid: number;
      firstMonthInterest: number;
    }
  | { valid: false; error: string; paymentTooLow?: boolean; firstMonthInterest?: number };

export const MAX_MONTHS = 1200;

export function monthlyRate(apr: number): number {
  return apr / 100 / 12;
}

/** Payment needed to pay off `balance` in exactly `months` equal payments. */
export function requiredPayment(balance: number, apr: number, months: number): number {
  const r = monthlyRate(apr);
  if (r === 0) return balance / months;
  return (balance * r) / (1 - Math.pow(1 + r, -months));
}

/** Month-by-month simulation with a fixed payment; the last payment is partial. */
export function simulatePayoff(balance: number, apr: number, payment: number) {
  const r = monthlyRate(apr);
  let remaining = balance;
  let months = 0;
  let totalInterest = 0;
  let lastPayment = 0;
  while (remaining > 1e-9 && months < MAX_MONTHS) {
    const interest = remaining * r;
    totalInterest += interest;
    const due = remaining + interest;
    lastPayment = Math.min(payment, due);
    remaining = due - lastPayment;
    months += 1;
  }
  return { months, totalInterest, lastPayment, paidOff: remaining <= 1e-9 };
}

export function computeCreditCardPayoff(input: CreditCardPayoffInput): CreditCardPayoffResult {
  const { mode, balance, apr } = input;
  if (!Number.isFinite(balance) || balance <= 0) {
    return { valid: false, error: "Enter a balance greater than $0." };
  }
  if (!Number.isFinite(apr) || apr < 0 || apr > 100) {
    return { valid: false, error: "Enter an APR between 0% and 100%." };
  }
  const firstMonthInterest = balance * monthlyRate(apr);

  if (mode === "payment") {
    const payment = input.monthlyPayment;
    if (!Number.isFinite(payment) || payment <= 0) {
      return { valid: false, error: "Enter a monthly payment greater than $0." };
    }
    if (payment <= firstMonthInterest + 1e-9) {
      return {
        valid: false,
        paymentTooLow: true,
        firstMonthInterest,
        error:
          "This payment doesn't cover the monthly interest, so the balance will never go down. Pay more than the first month's interest to make progress.",
      };
    }
    const sim = simulatePayoff(balance, apr, payment);
    if (!sim.paidOff) {
      return { valid: false, error: "This payment would take more than 100 years. Try a larger payment." };
    }
    return {
      valid: true,
      months: sim.months,
      monthlyPayment: payment,
      lastPayment: sim.lastPayment,
      totalInterest: sim.totalInterest,
      totalPaid: balance + sim.totalInterest,
      firstMonthInterest,
    };
  }

  const months = input.months;
  if (!Number.isFinite(months) || months < 1 || months > MAX_MONTHS || !Number.isInteger(months)) {
    return { valid: false, error: "Enter a whole number of months between 1 and 1,200." };
  }
  const payment = requiredPayment(balance, apr, months);
  const totalPaid = payment * months;
  return {
    valid: true,
    months,
    monthlyPayment: payment,
    lastPayment: payment,
    totalInterest: totalPaid - balance,
    totalPaid,
    firstMonthInterest,
  };
}

/** Whole months from `from` (YYYY-MM) to `to` (YYYY-MM). */
export function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  if (![fy, fm, ty, tm].every(Number.isFinite)) return Number.NaN;
  return (ty - fy) * 12 + (tm - fm);
}

export function formatMoney(value: number): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "−" : ""}$${abs}`;
}

export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (rest > 0 || years === 0) parts.push(`${rest} ${rest === 1 ? "month" : "months"}`);
  return parts.join(" ");
}
