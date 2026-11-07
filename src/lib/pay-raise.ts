export type RaiseMode = "percent" | "amount" | "reverse";
export type PayBasis = "hourly" | "salary";

export interface PayRaiseInput {
  mode: RaiseMode;
  basis: PayBasis;
  /** Current pay: hourly rate when basis is hourly, annual salary when salary. */
  currentPay: number;
  /** Raise percent (mode "percent"). */
  raisePercent: number;
  /** Raise amount in the same unit as currentPay (mode "amount"). */
  raiseAmount: number;
  /** New pay in the same unit as currentPay (mode "reverse"). */
  newPay: number;
  hoursPerWeek: number;
}

export interface PayBreakdown {
  hourly: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export type PayRaiseResult =
  | {
      valid: true;
      raisePercent: number;
      oldPay: PayBreakdown;
      newPay: PayBreakdown;
      difference: PayBreakdown;
    }
  | { valid: false; error: string };

export const WEEKS_PER_YEAR = 52;

export function breakdown(pay: number, basis: PayBasis, hoursPerWeek: number): PayBreakdown {
  const annual = basis === "hourly" ? pay * hoursPerWeek * WEEKS_PER_YEAR : pay;
  const weekly = annual / WEEKS_PER_YEAR;
  return {
    hourly: weekly / hoursPerWeek,
    weekly,
    monthly: annual / 12,
    annual,
  };
}

export function percentChange(oldPay: number, newPay: number): number {
  return ((newPay - oldPay) / oldPay) * 100;
}

export function computePayRaise(input: PayRaiseInput): PayRaiseResult {
  const { mode, basis, currentPay, hoursPerWeek } = input;
  if (!Number.isFinite(currentPay) || currentPay <= 0) {
    return { valid: false, error: "Enter current pay greater than 0." };
  }
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0 || hoursPerWeek > 168) {
    return { valid: false, error: "Enter hours per week between 0 and 168." };
  }
  let next: number;
  if (mode === "percent") {
    if (!Number.isFinite(input.raisePercent)) return { valid: false, error: "Enter a raise percent." };
    next = currentPay * (1 + input.raisePercent / 100);
  } else if (mode === "amount") {
    if (!Number.isFinite(input.raiseAmount)) return { valid: false, error: "Enter a raise amount." };
    next = currentPay + input.raiseAmount;
  } else {
    if (!Number.isFinite(input.newPay) || input.newPay <= 0) {
      return { valid: false, error: "Enter new pay greater than 0." };
    }
    next = input.newPay;
  }
  if (next <= 0) return { valid: false, error: "New pay must be greater than 0." };
  const oldPay = breakdown(currentPay, basis, hoursPerWeek);
  const newPay = breakdown(next, basis, hoursPerWeek);
  return {
    valid: true,
    raisePercent: percentChange(currentPay, next),
    oldPay,
    newPay,
    difference: {
      hourly: newPay.hourly - oldPay.hourly,
      weekly: newPay.weekly - oldPay.weekly,
      monthly: newPay.monthly - oldPay.monthly,
      annual: newPay.annual - oldPay.annual,
    },
  };
}

export function formatMoney(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPct(n: number): string {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}
