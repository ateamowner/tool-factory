export type Debt = {
  name: string;
  balance: number;
  apr: number; // percent, e.g. 19.99
  minPayment: number;
};

export type Strategy = "avalanche" | "snowball";

export type ScheduleRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

export type StrategyResult = {
  strategy: Strategy;
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: ScheduleRow[];
  payoffOrder: string[];
};

export type DebtPayoffResult =
  | { valid: false; error: string }
  | {
      valid: true;
      avalanche: StrategyResult;
      snowball: StrategyResult;
      interestSaved: number; // snowball interest minus avalanche interest
    };

const MAX_MONTHS = 1200;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function simulate(debts: Debt[], extra: number, strategy: Strategy): StrategyResult | null {
  const list = debts.map((d, i) => ({ ...d, name: d.name || `Debt ${i + 1}`, index: i, bal: d.balance }));
  const schedule: ScheduleRow[] = [];
  const payoffOrder: string[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  const order = (a: (typeof list)[number], b: (typeof list)[number]) => {
    if (strategy === "avalanche") {
      return b.apr - a.apr || a.bal - b.bal || a.index - b.index;
    }
    return a.bal - b.bal || b.apr - a.apr || a.index - b.index;
  };

  while (list.some((d) => d.bal > 0.005)) {
    month += 1;
    if (month > MAX_MONTHS) return null;
    let interest = 0;
    for (const d of list) {
      if (d.bal <= 0.005) continue;
      const i = round2((d.bal * d.apr) / 100 / 12);
      d.bal = round2(d.bal + i);
      interest += i;
    }
    // Pay minimums first
    let budget = round2(debts.reduce((s, d) => s + d.minPayment, 0) + extra);
    let paidThisMonth = 0;
    const active = list.filter((d) => d.bal > 0.005);
    for (const d of active) {
      const pay = Math.min(d.minPayment, d.bal);
      d.bal = round2(d.bal - pay);
      budget = round2(budget - pay);
      paidThisMonth = round2(paidThisMonth + pay);
    }
    // Budget freed by already-paid-off debts plus extra goes to the target debt
    const targets = list.filter((d) => d.bal > 0.005).sort(order);
    for (const d of targets) {
      if (budget <= 0.005) break;
      const pay = Math.min(budget, d.bal);
      d.bal = round2(d.bal - pay);
      budget = round2(budget - pay);
      paidThisMonth = round2(paidThisMonth + pay);
    }
    for (const d of active) {
      if (d.bal <= 0.005 && !payoffOrder.includes(d.name + "#" + d.index)) {
        payoffOrder.push(d.name + "#" + d.index);
      }
    }
    const remaining = round2(list.reduce((s, d) => s + Math.max(d.bal, 0), 0));
    totalInterest = round2(totalInterest + interest);
    totalPaid = round2(totalPaid + paidThisMonth);
    schedule.push({
      month,
      payment: paidThisMonth,
      interest: round2(interest),
      principal: round2(paidThisMonth - interest),
      balance: remaining,
    });
  }

  return {
    strategy,
    months: month,
    totalInterest,
    totalPaid,
    schedule,
    payoffOrder: payoffOrder.map((s) => s.replace(/#\d+$/, "")),
  };
}

export function computeDebtPayoff(debts: Debt[], extra: number): DebtPayoffResult {
  const used = debts.filter((d) => d.balance > 0 || d.minPayment > 0 || d.apr > 0);
  if (used.length === 0) return { valid: false, error: "Enter at least one debt with a balance." };
  for (const d of used) {
    if (![d.balance, d.apr, d.minPayment].every(Number.isFinite)) {
      return { valid: false, error: "Enter numbers only for balance, APR, and minimum payment." };
    }
    if (d.balance < 0 || d.apr < 0 || d.minPayment < 0) {
      return { valid: false, error: "Balance, APR, and minimum payment cannot be negative." };
    }
  }
  if (!Number.isFinite(extra) || extra < 0) {
    return { valid: false, error: "Extra monthly payment must be zero or more." };
  }
  const withBalance = used.filter((d) => d.balance > 0);
  if (withBalance.length === 0) return { valid: false, error: "Enter at least one debt with a balance above zero." };
  for (const d of withBalance) {
    if (d.apr > 100) return { valid: false, error: "APR must be 100% or less." };
  }
  const budget = withBalance.reduce((s, d) => s + d.minPayment, 0) + extra;
  if (budget <= 0) return { valid: false, error: "Enter a minimum payment or an extra monthly payment." };

  const avalanche = simulate(withBalance, extra, "avalanche");
  const snowball = simulate(withBalance, extra, "snowball");
  if (!avalanche || !snowball) {
    return {
      valid: false,
      error: "These payments never pay the debts off (interest outpaces payments). Raise a minimum or the extra payment.",
    };
  }
  return {
    valid: true,
    avalanche,
    snowball,
    interestSaved: round2(snowball.totalInterest - avalanche.totalInterest),
  };
}

export function payoffDate(months: number, from: Date = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth() + months, 1);
  return d;
}
